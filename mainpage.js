
/* A MODELL implementation */
function Modell (storageKey) {
  var notifyer = null;
  var cartStorage = window.localStorage;
  var jsonData;
  var cartContent = {};
  var fullObjForStorage = {};

  /* a function for creating template */
  function createTemplateStorageObject (timeMs) {
    var result = {};
    result[storageKey] = {
      createdIn: timeMs,
      keysOfCart: {}
    };
    return result;
  }
  /* get cart content from a local storage
    keyID  -it`s a key in tle local storage */
  function getCartFromStorage (keyID) {
    var res;
    /* assign to a variable */
    res = fullObjForStorage[keyID].keysOfCart;
    return res;
  }
  /* store a cart to the local storage */
  function storeCartToStorage (keyID, cart) {
    var jsonRaw;

    /* 1: assign to an output object value of cart */
    fullObjForStorage[keyID].keysOfCart = cart;
    /* 2: convert ot the string */
    jsonRaw = JSON.stringify(fullObjForStorage);
    /* 3: put into the local storage */
    cartStorage.setItem(keyID, jsonRaw);
  }

  /* if a localStorage isn`t avaliable */
  if (!cartStorage) {
    return null;
  }

  jsonData = cartStorage.getItem(storageKey);
  /* checking if the key exists */
  if (jsonData) {
    /* parses a string */
    fullObjForStorage = JSON.parse(jsonData);
    /* how long ago has a data been stored */
    var tmp = Date.now() - fullObjForStorage[storageKey].createdIn;
    /* if the data is too old (10 minutes) - remove all the data
           and create a new empty value */
    /*    if (tmp > 36000) {
                  fullObjForStorage = createTemplateStorageObject(Date.now());
                  jsonData = JSON.stringify(fullObjForStorage);
                  cartStorage.setItem(storageKey,jsonData);
               } */
  } else {
    /* otherwise creating a place in the local storage: */
    /* 1: create an empty object-template for store */
    fullObjForStorage = createTemplateStorageObject(Date.now());
    /* 2: convert it to a string */
    jsonData = JSON.stringify(fullObjForStorage);
    cartStorage.setItem(storageKey, jsonData);
  }

  return {
    registerNotifier: function (f) {
      notifyer = f;
    },
    getData: function () {
      cartContent = getCartFromStorage(storageKey);
      /* get a part of object */
      return Object.assign({}, cartContent);
    },
    putData: function (keyCount) {
      cartContent = getCartFromStorage(storageKey);
      /* get a key */
      var k = Object.keys(keyCount)[0];
      /* set a value */
      cartContent[k] = keyCount[k];
      /* put into storage */
      storeCartToStorage(storageKey, cartContent);
      if (notifyer) {
        notifyer();
      }
    },
    removeData: function (key) {
      cartContent = getCartFromStorage(storageKey);
      /* remove a property */
      delete cartContent[key];
      /* save to a storage */
      storeCartToStorage(storageKey, cartContent);
    }
  };
}

/** *A choose Dispatcher class****/
function ChooseDispatcher (pNodeID) {
  const htmlTempl = '<div><input type="checkbox" class="chooseFlag" data-choose-checkbox="bread"/>' +
          '<label for="checkbox" class="chooseFlag">bakery products</label></div>' +
          ' <div><input type="checkbox" class="chooseFlag" data-choose-checkbox="milk"/>' +
          '<label for="checkbox" class="chooseFlag">dairy produce</label></div>' +
           ' <div><input type="checkbox" class="chooseFlag" data-choose-checkbox="alcohol"/>' +
          '<label for="checkbox" class="chooseFlag">alcohol</label></div>' +
                ' <div><input type="checkbox" class="chooseFlag" data-choose-checkbox="vegetables"/>' +
          '<label for="checkbox" class="chooseFlag">vegetables</label></div>' +
                ' <div><input type="checkbox" class="chooseFlag" data-choose-checkbox="meat"/>' +
          '<label for="checkbox" class="chooseFlag">meat</label></div>' +
               ' <div><input type="checkbox" class="chooseFlag" data-choose-checkbox="fruits"/>' +
          '<label for="checkbox" class="chooseFlag">fruits</label></div>';
  var callbackFunc = null;
  var parNode = document.getElementById(pNodeID);
  var containerNode;
  /* create a selection box in according to a template */
  containerNode = document.createElement('section');
  containerNode.setAttribute('class', 'chooseFlagsContainer');
  containerNode.insertAdjacentHTML('afterbegin', htmlTempl);
  if (!parNode) {
    return null;
  }
  /* show-hide event handler */
  function showHideHandler (evt) {
    /* if node isn`t exists - attach th e one */
    if (parNode.children.length === 0) {
      parNode.appendChild(containerNode);
    } else {
      /* thervise - remve node with checkboxes */
      containerNode = parNode.removeChild(containerNode);
    }
  }
  /* An event handler for checkbox events */
  function eventHandler (evt) {
    var result = {};
    /* get a container */
    var cont = evt.currentTarget.parentNode.parentNode;
    /* get an HTML list of buttons */
    var htmlCheckList = cont.getElementsByTagName('input');
    /* convert it ot an array */
    var btnOfCheckboxes = Array.prototype.slice.call(htmlCheckList);
    /* iterate an array */
    for (var q in btnOfCheckboxes) {
      result[btnOfCheckboxes[q].attributes[2].nodeValue] = btnOfCheckboxes[q].checked;
    }
    /* checking if a callback has been assigned */
    if (callbackFunc) {
      callbackFunc(result);
    }
  }
  return {
    bindToBtn: function (bNode) {
      bNode.addEventListener('click', showHideHandler, false);
    },
    registerCallback: function (f) {
      if (f) {
        callbackFunc = f;
      }
    },
    bindCheckboxes: function () {
      /* if (!callbackFunc) {
                return null;
            } */
      /* get a HTMLlist */
      var htmlList = containerNode.getElementsByTagName('input');
      /* convert it to an Array */
      var arrayOfCheckBoxes = Array.prototype.slice.call(htmlList);
      /* iterate and bind all the checkboxes to an eventHandler */
      arrayOfCheckBoxes.forEach(function (val) {
        val.addEventListener('click', eventHandler, false);
      });
    }
  };
}

/* A new wariant of GoodsPResenter */
function GoodsPresenterV1 () {
  var stockCallback = null;
  var arrayOfUL = null;

  var qToCart = new QueriesToCartDispatcherV1('goodsItemsMainWrp');
  var oItemsCreator = new ItemsCreatorV1();
  var pageDispatcher = new TurnPagesDispatcherV1(arrayOfUL, 'goodsItemsMainWrp');
  return {

    registerStockCallback: function (x) {
      stockCallback = x;
    },
    registerCartCallback: function (x1) {
      qToCart.registerCallback(x1);
    },
    forzeContent: function () {
      if (arrayOfUL) {
        pageDispatcher.lockButtons();
        qToCart.activate(false, arrayOfUL);
      }
    },
    updateContent: function (arrayOfKeys) {
      var result = {};
      /* if array isn`t empty */
      if (arrayOfUL) {
        /* unbind buttons */
        qToCart.unbindButtons(arrayOfUL);
        /* inactive */
      }
      /* iterate all the array */
      arrayOfKeys.forEach(function (value, index) {
        /* get info from stock and assign to result */
        result[value] = stockCallback(value);
      });
      /* create a new array of lists */
      arrayOfUL = oItemsCreator.buildArrayOfGoods(result);
      /* bind events again */
      qToCart.bindButtons(arrayOfUL);
      /* activate it */
      qToCart.activate(true, arrayOfUL);
      /* update in turnPagesDispatcher and
            embeds it to DOM */
      pageDispatcher.updateButtonsAndPresentation(arrayOfUL);
    }

  };
}

/* class ItemsCreatorV1************/
function ItemsCreatorV1 () {
  /* a function for create <li> (item)
    in according to HTML template */
  function createGoodItem (data, templ = null) {
    var tmpSubnode;
    /* create an html element */
    var itemNode = document.createElement('li');
    /* if a template isn`t exists */
    if (!templ) {
      templ = "<img data-item-field-id='image'/>" +
                  "<div data-item-field-id='name'>name?</div>" +
                  "<div data-item-field-id='units'>price?</div>" +
                  "<div data-item-field-id='price'>name?</div>" +
                  "<button data-btn-good-id='price' class='addToCartBtn addToCartBtnAnimation'>Add to cart</button>";
    }
    /* assign a  template(html) */
    itemNode.insertAdjacentHTML('beforeend', templ);
    /* get a key of goods */
    var key = Object.keys(data)[0];
    /* assign a key to an item */
    itemNode.setAttribute('data-item-presenter-key', key);
    /* iterate all the items */
    for (var index in data[key]) {
      /* if there is 'image' property */
      if (index === 'image') {
        /* choose <img> node */
        tmpSubnode = itemNode.querySelector('[data-item-field-id=' + index + ']');
        /* iterate properties of 'image' subobject */
        for (var z in data[key][index]) {
          tmpSubnode.setAttribute(z, data[key][index][z]);
        }
      } else {
        /* otherwise set an innnerText */
        /* 1)choose sub-node */
        tmpSubnode = itemNode.querySelector('[data-item-field-id=' + index + ']');
        /* 2)Set an inner text */
        tmpSubnode.innerText = data[key][index].toString();
      }
    }
    /* return an item element */
    return itemNode;
  }
  /* create a n <ul> element and initialize it */
  function createGoodsContainer (idOfNode, classOfNode) {
    /* create an unordered list */
    var resultNode = document.createElement('ul');
    /* assign attributes */
    resultNode.setAttribute('class', classOfNode);
    resultNode.setAttribute('id', idOfNode);
    /* return a result node */
    return resultNode;
  }

  return {
    /* an Interface for create an array of
        <ul> with cildren (<li>-item).If there
        more that 10 items per <ul> than will be created additional
        cell-list (<ul>) in the output array. This function
        assigns additionary a property "index:0" -
        it needs for a "TurnPagesDispatcher" */
    /* @data - it`s data to assign to <li>-items
        */
    buildArrayOfGoods (data, template = null) {
      var tmp = null;
      var result = [];
      var indexOfItemInData = 0;
      var indexOfResultArray = 0;
      /* create a start node  and assign it to an Array */
      result[indexOfResultArray] = createGoodsContainer('goodsMainHolder' + indexOfResultArray.toString(), 'goodsHolderContainer');
      /* iterate an input object */
      for (var k in data) {
        /* checking if the value of count of
                 children in a list exceed a MAX count */
        if (indexOfItemInData > 5) {
          /* assign a next cell in the Array */
          indexOfResultArray += 1;
          /* create a next <ul> list */
          result[indexOfResultArray] = createGoodsContainer('goodsMainHolder' + indexOfResultArray.toString(), 'goodsHolderContainer');
          /* clear index */
          indexOfItemInData = 0;
        }
        tmp = {};
        /* cerate a piece of object-list */
        tmp[k] = data[k];
        /* create an item into <ul> element */
        result[indexOfResultArray].appendChild(createGoodItem(tmp, template));
        /* increment a counter of items */
        indexOfItemInData += 1;
      }
      result.index = 0;
      return result;
    }
  };
}

/* class TurnPagesDispatcherV1 */
function TurnPagesDispatcherV1 (arrayOfN, idOfParent) {
  var htmlTemplate = '<div></div><div><div></div>' +
        '<button class="turnPageBtn" data-btn-click="backward">&#60;</button>' +
        '<button class="turnPageBtn" data-btn-click="forward">&#62;</button>';

  /* make an unbounded copy */
  var arrayOfNodes = arrayOfN;// Array.from(arrayOfN);
  var listWrapper = null;
  var btnWrapper = null;
  var btnFwd;
  var btnBckwd;
  /* -get a Parent node */
  var pNode = document.getElementById(idOfParent);
  pNode.insertAdjacentHTML('afterbegin', htmlTemplate);
  /* if (!arrayOfNodes){
        return nulll;
    } */
  /* get subnodes */
  listWrapper = pNode.getElementsByTagName('div')[0];
  btnWrapper = pNode.getElementsByTagName('div')[1];
  /* get butttons-nodes */
  btnFwd = btnWrapper.querySelector('[data-btn-click="forward"]');
  btnBckwd = btnWrapper.querySelector('[data-btn-click="backward"]');
  /* bind to event */
  btnBckwd.addEventListener('click', clickHandler, false);
  btnFwd.addEventListener('click', clickHandler, false);
  /* btn active/inactive functions */
  function activateButton (bNode) {
    bNode.style.opacity = 1.0;
    bNode.disabled = false;
    bNode.setAttribute('class', 'btnAndGoodsAnimation');
  }

  function deActivateButton (bNode) {
    bNode.style.opacity = 0.3;
    bNode.disabled = true;
    bNode.removeAttribute('class');
  }
  /* parse event and return a object
    with key:value */
  function attribPairs (targNode) {
    var result = {};
    var attrList = targNode.attributes;
    attrList = Array.prototype.slice.call(attrList);
    attrList.forEach(function (val, ind) {
      result[val.name] = val.nodeValue;
    });
    return result;
  }
  /* set position of scrollBar on the bottom */
  function goToBottom () {
    window.scrollBy(0, 0);/* window.innerHeight */
  }
  /* set page number */
  function setPageNumber (objWithLists, btnHolder) {
    var text = 'Page ' + (objWithLists.index + 1) + ' of ' + (objWithLists.length);
    btnHolder.querySelector('div').innerText = text;
  }
  /* buttons EventHandler */
  function clickHandler (event) {
    var newIndex = arrayOfNodes.index;
    var flag = attribPairs(event.currentTarget)['data-btn-click'];
    /* choose plus/minus */
    if (flag === 'forward') {
      newIndex++;
    }
    if (flag === 'backward') {
      newIndex--;
    }
    /* checking - have we ever reached to first/last element? */
    /* CASE-1) - the first element */
    if (newIndex === 0) {
      /* block button 'Back' */
      deActivateButton(btnBckwd);
      activateButton(btnFwd);
    }
    /* CASE-2) - the last element */
    if (newIndex === (arrayOfNodes.length - 1)) {
      /* block the button Forward */
      deActivateButton(btnFwd);
      activateButton(btnBckwd);
    }
    /* CASE-3) the element in range from 0 to array.LENGTH */
    if ((newIndex < (arrayOfNodes.length - 1)) && (newIndex > 0)) {
      /* then activate two buttons */
      activateButton(btnFwd);
      activateButton(btnBckwd);
    }
    /* cut previous node and save it */
    arrayOfNodes[arrayOfNodes.index] = listWrapper.removeChild(arrayOfNodes[arrayOfNodes.index]);
    /* append a new node */
    listWrapper.appendChild(arrayOfNodes[newIndex]);
    /* save e  new index in an Array */
    arrayOfNodes.index = newIndex;
    goToBottom();
    setPageNumber(arrayOfNodes, btnWrapper);
  }

  return {
    /* lock buttons until updateButtonsAndPresentation */
    lockButtons: function () {
      deActivateButton(btnBckwd);
      deActivateButton(btnFwd);
    },
    updateButtonsAndPresentation (newArrayOfLists) {
      /* remove existing nodes from DOM */
      var nodesToRemove = listWrapper.getElementsByTagName('ul');
      if (nodesToRemove.length) {
        /* convert to array */
        nodesToRemove = Array.prototype.slice.call(nodesToRemove);
        /* remove child */
        listWrapper.removeChild(nodesToRemove[0]);
      }
      /* refresh an array with lists */
      arrayOfNodes = newArrayOfLists;
      /* checking is a list wrapper empty */
      if (listWrapper.getElementsByTagName('ul').length === 0) {
        /* asssign  an elem "index" to the parent node */
        listWrapper.appendChild(arrayOfNodes[arrayOfNodes.index]);
        /* if the array contain a one element - block two buttons */
        if (arrayOfNodes.length === 1) {
          /* Set a button inactive and half-transparent */
          deActivateButton(btnBckwd);
          deActivateButton(btnFwd);
        } else {
          /* Set a button inactive and half-transparent */
          deActivateButton(btnBckwd);
          /* a button active and opaque**/
          activateButton(btnFwd);
        }
      }
      setPageNumber(arrayOfNodes, btnWrapper);
    }
  };
}

/* QueriesToCartDispatcherV1 */
function QueriesToCartDispatcherV1 (pNodeID) {
  var pNodeGoods = document.getElementById(pNodeID);
  var waitingIconNode;
  var callbackFunc = null;
  /* create a wait icon node */
  waitingIconNode = document.createElement('img');
  waitingIconNode.setAttribute('src', 'wait.svg');
  waitingIconNode.setAttribute('data-image-id', 'wait_animation');
  waitingIconNode.style.position = 'fixed';

  waitingIconNode.style.zIndex = 10;
  waitingIconNode.style.bottom = (window.innerHeight / 2).toString() + 'px';
  waitingIconNode.style.left = (window.innerWidth / 2).toString() + 'px';
  /* parse event and return a object
    with key:value */
  function attribPairs (targNode) {
    var result = {};
    var attrList = targNode.attributes;
    attrList = Array.prototype.slice.call(attrList);
    attrList.forEach(function (val, ind) {
      result[val.name] = val.nodeValue;
    });
    return result;
  }
  function eventHandler (evt) {
    var result = {};
    var tmp = attribPairs(evt.currentTarget.parentNode);
    result[tmp['data-item-presenter-key']] = 1;
    callbackFunc(result);
  }

  return {
    registerCallback: function (z) {
      callbackFunc = z;
    },
    activate: function (flag, arrayOfGoods) {
      var btnList;
      /* set current index - visible content */
      var ind = arrayOfGoods.index;
      /* if inactive - set half-transparency */
      if (flag) {
        arrayOfGoods[ind].style.opacity = 1.0;
        /* delete waitingIconNode */
        if (pNodeGoods.querySelector('[data-image-id="wait_animation"]')) {
          waitingIconNode = pNodeGoods.removeChild(waitingIconNode);
        }
      } else {
        arrayOfGoods[ind].style.opacity = 0.3;
        if (!pNodeGoods.querySelector('[data-image-id="wait_animation"]')) {
          /* embed waitingIconNode */
          pNodeGoods.appendChild(waitingIconNode);
        }
      }
      /* get a HTMLlist of buttons */
      btnList = arrayOfGoods[ind].getElementsByTagName('button');
      /* convert to array */
      btnList = Array.prototype.slice.call(btnList);
      /* iterate inner buttons */
      for (var z in btnList) {
        /* if true - activate button, othervise - deactivate */
        if (flag) {
          btnList[z].style.opacity = 1.0;
          btnList[z].disabled = false;
          btnList[z].setAttribute('class', 'addToCartBtnAnimation addToCartBtn');
        } else {
          btnList[z].style.opacity = 0.3;
          btnList[z].disabled = true;
          btnList[z].setAttribute('class', 'addToCartBtn');
        }
      }
    },

    bindButtons: function (arrayOfGoods) {
      if (!callbackFunc) {
        return -1;
      }
      var btnList;
      /* iterate all the <li> branches in <ul> */
      for (var ind = 0; ind < arrayOfGoods.length; ind++) {
        /* get a HTMLlist of buttons */
        btnList = arrayOfGoods[ind].getElementsByTagName('button');
        /* convert to array */
        btnList = Array.prototype.slice.call(btnList);
        /* iterate inner buttons */
        for (var z in btnList) {
          /* bind event to handler */
          btnList[z].addEventListener('click', eventHandler, false);
        }
      }
    },
    unbindButtons: function (arrayOfGoods) {
      if (!callbackFunc) {
        return -1;
      }
      var btnList;
      /* iterate all the <li> branches in <ul> */
      for (var ind = 0; ind < arrayOfGoods.length; ind++) {
        /* get a HTMLlist of buttons */
        btnList = arrayOfGoods[ind].getElementsByTagName('button');
        /* convert to array */
        btnList = Array.prototype.slice.call(btnList);
        /* iterate inner buttons */
        for (var z in btnList) {
          /* bind event to handler */
          btnList[z].removeEventListener('click', eventHandler);
        }
      }
    }
  };
}

/*****************************************************
new version of Presenter - for a cart */
function ItemMaker (htmlTemplate, attrTemplate = 'data-cart-item-id') {
  var attrT = attrTemplate;
  var template = "<div><img src='undef_cart.svg' data-inner='src'></div>" +
             "<div data-inner='name'>Lorem ipsum dolor sit amet</div>" +
             "<div data-inner='price'>price</div>" +
             "<div data-inner='quantity'>quantity</div>" +
             "<div data-inner='total'>total</div>";
  var stockCallBk = null;
  /* input format {key:countOfItems} */
  function buildInfo (keyVal) {
    if (!stockCallBk) {
      return null;
    }
    var result = null;
    /* get a key */
    var key = Object.keys(keyVal)[0];
    /* get info from a stock */
    var stockData = stockCallBk(key);
    /* copy properties */
    result = Object.assign({}, stockData);
    /* asign new properties to result */
    result.quantity = keyVal[key];
    result.total = result.quantity * /[+-]?([0-9]*[.])?[0-9]+/.exec(result.price)[0];
    /* moving UNITS to QUANTITY */
    result.quantity += result.units;
    delete result.units;
    return result;
  }
  return {
    regStockCallBk: function (f) {
      stockCallBk = f;
    },
    /* making <li> node
        and fill it conent in according to template */
    makeItemNode: function (keyVal) {
      var objForEmbedding;
      /* get a key */
      var key = Object.keys(keyVal)[0];
      /* create a node and assign attributes */
      var liNode = document.createElement('li');
      liNode.setAttribute(attrT, key);
      liNode.setAttribute('class', 'ItemsOfCart');
      /* fill content */
      liNode.insertAdjacentHTML('afterbegin', template);
      objForEmbedding = buildInfo(keyVal);

      /* iterate all the properties and assign it to 'in-memory' DOM */
      var iterKeys = Object.keys(objForEmbedding);
      iterKeys.forEach(function (val, ind) {
        if (val === 'src') {
          liNode.querySelector('[data-inner=' + val + ']').setAttribute('src', objForEmbedding[val]);
        } else {
          liNode.querySelector('[data-inner=' + val + ']').innerText = objForEmbedding[val].toString();
        }
      });
      return liNode;
    }

  };
}

/* class domUpdater */
function DomUpdater () {
  /* calculation sum and grand-sum */
  function sumCalc (pNode, nodesArr, attrOfSum = 'all-the-sum', attrOfGrandSum = 'grand-sum', grSumCoef = 0.9) {
    var sNode = pNode.querySelector('[data-elem=' + attrOfSum + ']');
    var gNode = pNode.querySelector('[data-elem=' + attrOfGrandSum + ']');
    var sum = 0.0;
    var grSum = 0.0;
    nodesArr.forEach(function (val, ind) {
      sum += parseFloat(val.querySelector("[data-inner='total']").innerText);
      grSum += (parseFloat(val.querySelector("[data-inner='total']").innerText) * grSumCoef);
    });
    if (sNode && gNode) {
      sNode.innerText = '$' + sum.toPrecision(2);
      gNode.innerText = '$' + grSum.toPrecision(2);
    }
  }
  return {
    updateCartNodes (pNodeAttrID, nodesArray) {
      var parNode = document.querySelector('[data-elem=' + pNodeAttrID + ']');
      /* if the node hasn`t been found */
      if (!parNode) {
        return -1;
      }
      /* if <us> has children */
      if (parNode.children.length !== 0) {
        return -1;
      }
      /* iterate array on <li> and assign them to parent node */
      nodesArray.forEach(function (val) {
        parNode.appendChild(val);
      });
      /* set sum and grandSum */
      sumCalc(document.querySelector('.cartSubcontainer'), nodesArray);
    }
  };
}

/* proxyNode */
function ProxyNode (pNodeID) {
  var pNode = document.getElementById(pNodeID);
  if (!pNode) {
    return null;
  }
  var htmlPattern = '<div>No goods in cart</div>';
  var proxyNode = document.createElement('article');
  proxyNode.setAttribute('class', 'cartNoGoods');
  proxyNode.insertAdjacentHTML('afterbegin', htmlPattern);
  var savedNode = pNode.querySelector('.cartSubcontainer');
  return {
    proxy: function (flag) {
      if (flag) {
        if (pNode.querySelector('.cartSubcontainer')) {
          /* remove */
          savedNode = pNode.removeChild(savedNode);
          /* asssign a proxy node */
          pNode.appendChild(proxyNode);
        }
      } else {
        /* restore */
        if (pNode.querySelector('.cartNoGoods')) {
          proxyNode = pNode.removeChild(proxyNode);
          pNode.appendChild(savedNode);
        }
      }
    }
  };
}

/* DOM cleaner */
function DomCleaner () {
  return {
    clearCart: function (pNodeID) {
      var pNode = document.querySelector('[data-elem=' + pNodeID + ']');
      if (!pNode) {
        return null;
      }
      var nodeList = pNode.children;
      nodeList = Array.prototype.slice.call(nodeList);
      nodeList.forEach(function (val) {
        pNode.removeChild(val);
      });
    }
  };
}

/* domMgr */
function DomMgr (pNodeID) {
  const ulNodeAttr = 'goods-cart-wrapper';
  var updater = new DomUpdater();
  var cleaner = new DomCleaner();
  var prxy = new ProxyNode('cartContainer');
  if ((!updater) || (!cleaner) || (!prxy)) {
    return null;
  }
  return {
    translateToDom: function (inpArr) {
      cleaner.clearCart(ulNodeAttr);
      /* if an array empty (without <li> - set proxy */
      if (inpArr.length === 0) {
        prxy.proxy(true);
        return 0;
      } else {
        prxy.proxy(false);
      }
      /* update (assign new) nodes */
      updater.updateCartNodes(ulNodeAttr, inpArr);
    }
  };
}
/* appereanceMgr */
function AppereanceMgr (pID) {
  var cartNode = document.getElementById(pID);
  /* click handler, msg - formal, 'optional' parameter */
  function showHide (msg) {
    if (cartNode.style.display === 'flex') {
      cartNode.style.display = 'none';
    } else {
      cartNode.style.display = 'flex';
    }
  }
  /* it node in`t exists */
  if (!cartNode) {
    return null;
  }
  return {
    regBtn: function (btnAttrID) {
      /* get button`s node */
      var bNode = document.querySelector('[data-btn-cart-mnu=' + btnAttrID + ']');
      if (!bNode) {
        /* if the node hasn`t been found - return null */
        return null;
      }
      bNode.addEventListener('click', showHide);
    }
  };
}

/** ******presenterOfCart */
function PresenterOfCart () {
  var nodesArray = [];
  var tmp = {};
  var dMgr = new DomMgr('cartContainer');
  var iMaker = new ItemMaker();
  var apMgr = new AppereanceMgr('cartContainer');

  function setCountOfItems (nodeAttrId, keyValList) {
    var countShowNode = document.querySelector('[data-btn-cart-mnu=' + nodeAttrId + ']');
    var cnt = Object.keys(keyValList).length;
    countShowNode.innerText = cnt + ' ITEM(S)';
  }
  return {
    regStockQuery: function (f) {
      iMaker.regStockCallBk(f);
    },
    btnReg: function (attrID) {
      apMgr.regBtn(attrID);
    },
    useCaseInput: function (keyVal) {
      /* clear nodes array */
      nodesArray = [];
      /* get an array with enumerable keys */
      var keysArray = Object.keys(keyVal);
      /* if length != 0, */
      if (keysArray.length !== 0) {
        /* iterate it */
        keysArray.forEach(function (val, index) {
          /* clear key:value container */
          tmp = {};
          tmp[val] = keyVal[val];
          nodesArray[index] = iMaker.makeItemNode(tmp);
        });
      }
      dMgr.translateToDom(nodesArray);
      setCountOfItems('cartMnuCount', keyVal);
    }
  };
}

/** * A plug-class : emulating backend**/
function PseudoServer () {
  /* for a goods presenter */
  var goodsInfo = {
    g0001: { name: 'bread', price: '$1.25', units: 'pcs', image: { src: 'bread01.jpg' }, keys: 'bread', src: 'bread01_32.jpg' },
    g0002: { name: 'bisquits', price: '$1.25', units: 'Kg', image: { src: 'bisc01.jpg' }, keys: 'bread', src: 'bisc01_32.jpg' },
    g0003: { name: 'croissant', price: '$1.25', units: 'pcks', image: { src: 'croissant01.jpg' }, keys: 'bread', src: 'croissant01_32.jpg' },
    g0004: { name: 'milk', price: '$1.25', units: 'btl', image: { src: 'milk01.jpg' }, keys: 'milk', src: 'milk01_32.jpg' },
    g0005: { name: 'chese', price: '$1.25', units: 'Kg', image: { src: 'chese01.jpg' }, keys: 'milk', src: 'chese01_32.jpg' },
    g0006: { name: 'chese(head)', price: '$1.25', units: 'Pcs', image: { src: 'chese-head01.jpg' }, keys: 'milk', src: 'chese-head01_32.jpg' },
    g0007: { name: 'Vodka "Finlandia 0.7l"', price: '$1.25', units: 'Btl', image: { src: 'vodka01.jpg' }, keys: 'alcohol', src: 'vodka01_32.jpg' },
    g0008: { name: 'beer Varschteiner 0.5l', price: '$1.25', units: 'btl', image: { src: 'beer01.jpg' }, keys: 'alcohol', src: 'beer01_32.jpg' },
    g0009: { name: 'Potato', price: '$1.25', units: 'Kg', image: { src: 'potato01.jpg' }, keys: 'vegetables', src: 'potato01_32.jpg' },
    g0010: { name: 'Onion', price: '$1.25', units: 'Kg', image: { src: 'onion01.jpg' }, keys: 'vegetables', src: 'onion01_32.jpg' },
    g0011: { name: 'Carrots', price: '$1.25', units: 'Kg', image: { src: 'carrots01.jpg' }, keys: 'vegetables', src: 'carrots01_32.jpg' },
    g0012: { name: 'sausages', price: '$1.25', units: 'pcs', image: { src: 'sausages01.jpg' }, keys: 'meat', src: 'sausages01_32.jpg' },
    g0013: { name: 'pork neck', price: '$1.25', units: 'Kg', image: { src: 'porkneck01.jpg' }, keys: 'meat', src: 'porkneck01_32.jpg' },
    g0014: { name: 'Hamon', price: '$1.25', units: 'Kg', image: { src: 'hamon01.jpg' }, keys: 'meat', src: 'hamon01_32.jpg' },
    g0015: { name: 'sheep meat', price: '$1.25', units: 'Kg', image: { src: 'sheepmeat01.jpg' }, keys: 'meat', src: 'sheepmeat01_32.jpg' },
    g0016: { name: 'apple', price: '$1.25', units: 'Kg', image: { src: 'apple01.jpg' }, keys: 'fruits', src: 'apple01_32.jpg' },
    g0017: { name: 'orange', price: '$1.25', units: 'Kg', image: { src: 'orange01.jpg' }, keys: 'fruits', src: 'orange01_32.jpg' },
    g0018: { name: 'pear', price: '$1.25', units: 'Kg', image: { src: 'pear01.jpg' }, keys: 'fruits', src: 'pear01_32.jpg' },
    g0019: { name: 'tomato', price: '$1.25', units: 'Kg', image: { src: 'tomato01.jpg' }, keys: 'vegetables', src: 'tomato01_32.jpg' },
    g0020: { name: 'butter', price: '$1.25', units: 'btl', image: { src: 'butter01.jpg' }, keys: 'milk', src: 'butter01_32.jpg' }
  };

  return {
    /* for a 'cart-Wiew' */
    stockQueryForCart: function (id) {
      var returnedValue = {};
      returnedValue = Object.assign({}, goodsInfo[id]);
      /* remove unneccessary values */
      delete returnedValue.image;
      delete returnedValue.keys;
      return returnedValue;
    },
    /* for a 'goods-wiew' */
    stockInfoGoodsQuery: function (id) {
      var returnedValue = {};
      returnedValue = Object.assign({}, goodsInfo[id]);
      /* remove unneccessary values */
      delete returnedValue.src;
      delete returnedValue.keys;
      return returnedValue;
    },
    stockFilterOfGoods: function (keyV) {
      var preKeys = {};
      var returnedVal = [];
      var index = 0;
      /** iterate all the properties and save wich have true**/
      var tmpArray = Object.keys(keyV);
      tmpArray.forEach(function (val, ind) {
        if (keyV[val]) {
          preKeys[val] = true;
        }
      });
      /* if length > 0 */

      if (Object.keys(preKeys).length > 0) {
        var iteratedArray = Object.keys(preKeys);
        iteratedArray.forEach(function (val, ind) {
          /* iterate all the base */
          for (var q in goodsInfo) {
            /* if a value of property 'keys' equals to a input key */
            if (goodsInfo[q].keys === val) {
              returnedVal[index] = q;
              index++;
            }
          }
        });
      } else {
        /* othervise return all the product keys */
        for (var z in goodsInfo) {
          returnedVal[index] = z;
          index++;
        }
      }

      return returnedVal;
    }
  };
}

/* useCase */
function UseCaseIneractorAddingToCart () {
  var dataForInit;
  var mod = new Modell('myCartStorage123465789');
  var choosedisp = new ChooseDispatcher('chooseGoodsContainer');
  var presOfCart = new PresenterOfCart();
  var goodspres = new GoodsPresenterV1();
  var pseudoserver = new PseudoServer();
  /* ----------choose dispatcher activate */
  choosedisp.bindCheckboxes();
  /* 2)bind to button */
  choosedisp.bindToBtn(document.querySelector('[data-btn-y="tst"]'));
  /* 3)reg callaack */
  choosedisp.registerCallback(onChooseGoods);
  /* -----------modell activate */
  mod.registerNotifier(onModellNotify);
  /* ----------- presenter of cart activate */
  presOfCart.btnReg('cart_mnu_call');
  presOfCart.regStockQuery(pseudoserver.stockQueryForCart);
  /* ----------goods presenter activate */
  goodspres.registerStockCallback(pseudoserver.stockInfoGoodsQuery);
  goodspres.registerCartCallback(onAddToCart);

  function onChooseGoods (btnStates) {
    /* block a goods presenter */
    goodspres.forzeContent();
    /* send a query to a pseudo-server */
    var response = pseudoserver.stockFilterOfGoods(btnStates);
    /* update a goods view */
    goodspres.updateContent(response);
    /* unblock a goods presenter */
  }

  function onAddToCart (keyCount) {
    /* checking - is there an item in a cart? */
    var key = Object.keys(keyCount)[0];
    var tmp = mod.getData();
    if (key in tmp) {
      /* adding count in a Cart
            with count we have (as parameter) */
      keyCount[key] = keyCount[key] + tmp[key];
    }
    /* put data to Modell */
    mod.putData(keyCount);
  }

  function onModellNotify () {
    var res = mod.getData();
    presOfCart.useCaseInput(res);
  }
  /** start initializating */
  onChooseGoods({});
  /* checking a modell */
  dataForInit = mod.getData();
  presOfCart.useCaseInput(dataForInit);
  // goodspres.forzeContent(true);
}
/** for smooth scrolling */
function ScrollSmoothCart () {
  var nodeContainer;
  var step = 15;
  function onScroll (evt) {
    var scrollSizeH = evt.currentTarget.scrollHeight;
    var currentPos = evt.currentTarget.scrollTop;
    /* skip a usual event handler */
    evt.preventDefault();
    /* if scrolling up */
    if (evt.deltaY > 0) {
      /* check limit */
      if ((currentPos + step) <= scrollSizeH) {
        currentPos = currentPos + step;
      }
    } else { /* othervise scrolling down */
      /* check limit */
      if ((currentPos - step) >= 0) {
        currentPos = currentPos - step;
      }
    }
    /* assign a current position */
    evt.currentTarget.scrollTop = currentPos;
  }

  return {
    registerElementAndEventHandler: function (cNode) {
      nodeContainer = cNode;
      nodeContainer.addEventListener('wheel', onScroll, false);
    }
  };
  /** register an event */
}

var useCase001;
var scrBar;
window.onload = function () {
  useCase001 = new UseCaseIneractorAddingToCart();
  scrBar = new ScrollSmoothCart();
  scrBar.registerElementAndEventHandler(document.querySelector('.scroller'));
  // scrBar.addEventListener('wheel',onScr0001, false);
};
