
/* A MODELL implementation */
function Modell (storageKey) {
  var notifyer = null;
  var cartStorage = window.localStorage;
  var jsonData;
  var tmp;
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
    tmp = Date.now() - fullObjForStorage[storageKey].createdIn;
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
    getDataByKey: function (key) {
      var res = {};
      cartContent = getCartFromStorage(storageKey);
      res[key] = cartContent[key];
      return res;
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
      /* notify */
      if (notifyer) {
        notifyer();
      }
    }
  };
}

/* pNode - an <ul> element */
function NodesFabrica (pNode) {
  var parentNode = pNode;
  if (!pNode) {
    return null;
  }

  const desktTempl = '<div data-sect-cart="src"><img src="bread01_32.jpg"></div>' +
                     '<div data-sect-cart="name">name?</div><div data-sect-cart="price">price?</div>' +
                     '<div data-sect-cart="count"><article class="btnHolder">' +
                     '<button data-btn="plus">+</button><div>3</div>' +
                     '<button data-btn="minus">-</button></article></div>' +
                     "<div data-sect-cart='total'>$50</div>" +
                      "<button data-btn='remove'>X</button>";

  const mobTempl = '<div data-sect-cart="src"><img src="bread01_32.jpg"></div>' +
                   '<div data-sect-cart="name">?name</div>' +
                   '<div><div>Price:</div><div  data-sect-cart="price">$?</div></div>' +
                   '<div data-sect-cart="count"><div>Quantity:</div><article class="btnHolder">' +
                    "<button data-btn='plus'>+</button><div>3</div><button data-btn='minus'>-</button>" + '</article></div><div data-sect-cart="total">' +
                    "<div>Total:</div><div class='wrpRow'><div>$50</div><button data-btn='remove'>X</button></div></div>";
    /* creating a desktop version by the template */
  function createDskTopPart (templ) {
    /* create a main node */
    var nDesk = document.createElement('div');
    nDesk.setAttribute('class', 'desktopVarCartItem');
    /* assign a content */
    nDesk.insertAdjacentHTML('afterbegin', templ);
    /* return created node */
    return nDesk;
  }
  /* creating a mobile version by the template */
  function createMobilePart (templ) {
    /* create a main node */
    var nMob = document.createElement('div');
    nMob.setAttribute('class', 'mobileVarCartItem');
    /* assign a content */
    nMob.insertAdjacentHTML('afterbegin', templ);
    /* return created node */
    return nMob;
  }
  /* fill info into buttons: pNode-it`s */
  function pastIdIntoBtn (pNode, id) {
    var collection;
    var tmp;
    var nodeLi;
    /* select li node */
    nodeLi = pNode.querySelector('[data-item-id=' + id + ']');
    /* get collection of buttons in a <LI> */
    collection = nodeLi.getElementsByTagName('button');
    /* convert it to an array */
    collection = Array.prototype.slice.call(collection);
    /* iterate all the items */
    collection.forEach(function (value, index) {
      /* save attributes */
      tmp = value.getAttribute('data-btn');
      /* assign new atr */
      value.setAttribute('data-btn', id + '#' + tmp);
    });
  }

  return {

    createItemByKeyValue: function (keyV) {
      var key = Object.keys(keyV)[0];
      if (pNode.querySelector('[data-item-id=' + key + ']')) {
        console.error('The node has already been created!');
        return null;
      }

      /* create li elem */
      var liNode = document.createElement('li');
      liNode.setAttribute('data-item-id', key);
      var mobiPart = createMobilePart(mobTempl);
      var desktPart = createDskTopPart(desktTempl);
      /* assign children */
      liNode.appendChild(mobiPart);
      liNode.appendChild(desktPart);
      /* embed into a DOM */
      pNode.appendChild(liNode);
      /* fill button`s info */
      pastIdIntoBtn(pNode, key);
    },
    removeItemFromDom: function (key) {
      var item = parentNode.querySelector('[data-item-id=' + key + ']');
      if (!item) {
        console.error('anode has`n been created');
        return null;
      }
      parentNode.removeChild(item);
    },
    setProxy: function (b) {
      var tmp;
      if (b) {
        /* hide title of list */
        tmp = document.querySelector('.titleOfList');
        tmp.style.display = 'none';
        /* hide order button */
        tmp = document.querySelector('.orderSection');
        tmp.style.display = 'none';
        /* hide list */
        parentNode.style.display = 'none';
        /* show a proxy node - no goods */
        tmp = document.querySelector('.noGoods');
        tmp.style.display = 'block';
      } else {
        /* show title of list */
        tmp = document.querySelector('.titleOfList');
        tmp.style.display = '';
        /* show order button */
        tmp = document.querySelector('.orderSection');
        tmp.style.display = '';
        /* show list */
        parentNode.style.display = '';
        /* hide a proxy node - no goods */
        tmp = document.querySelector('.noGoods');
        tmp.style.display = '';
      }
    }
  };
}
/* nodes updater*********/
function NodeUpdater (pNode) {
  var parent = pNode;
  var callbackF = null;
  /* fill info into nodes */
  function fillInfoIntoNodes (listNode, idVal) {
    var temp;
    var subnode;
    var keyOfItem = Object.keys(idVal)[0];
    /* get a  li node */
    var liNode = listNode.querySelector('[data-item-id=' + keyOfItem + ']');
    if (!liNode) {
      console.error('<li>node hasn`t been found!');
      return null;
    }
    /* get a desktop and a mobile part */
    var desk = liNode.querySelector('.desktopVarCartItem');
    var mobile = liNode.querySelector('.mobileVarCartItem');
    /* get info about an item from a stock - a name, an image, a price */
    if (!callbackF) {
      console.error('callback function hasn`t  been registered!');
      return -1;
    }
    var infoFromStock = callbackF(keyOfItem);

    /* assign count */
    infoFromStock.count = idVal[keyOfItem];
    /* calculate sum */
    infoFromStock.total = /[+-]?([0-9]*[.])?[0-9]+/.exec(infoFromStock.price)[0] * infoFromStock.count;
    /* save a stock response in a variable */
    temp = Object.assign({}, infoFromStock);
    /* iterate and assign values for a desktop part */
    for (var index in infoFromStock) {
      if (index === 'src') {
        subnode = desk.querySelector('[data-sect-cart=' + index + ']');
        subnode = subnode.querySelector('img');
        subnode.setAttribute('src', infoFromStock[index]);
      }
      /* if there is a nested block */
      if (index === 'count') {
        /* get a nested elem */
        subnode = desk.querySelector('[data-sect-cart="count"]');
        subnode = subnode.querySelector('div');
        subnode.innerText = infoFromStock.count.toString() + infoFromStock.units;
        delete infoFromStock.units;
      } if ((index !== 'count') && (index !== 'units') && (index !== 'src')) {
        /* fill data to  other nodes */
        /* get a nested elem */
        subnode = desk.querySelector('[data-sect-cart=' + index + ']');
        subnode.innerText = infoFromStock[index];
      }
    }
    /* restore */
    infoFromStock = temp;
    /* iterate values for a mobile part */
    for (var index01 in infoFromStock) {
      if (index01 === 'src') {
        subnode = mobile.querySelector('[data-sect-cart=' + index01 + ']');
        subnode = subnode.querySelector('img');
        subnode.setAttribute('src', infoFromStock[index01]);
      }
      /* if there is a nested block */
      if (index01 === 'count') {
        /* get a nested elem */
        subnode = mobile.querySelector('[data-sect-cart="count"]');
        subnode = subnode.querySelector('.btnHolder');
        subnode = subnode.querySelector('div');
        subnode.innerText = infoFromStock.count.toString() + infoFromStock.units;
        delete infoFromStock.units;
      } if (index01 === 'total') {
        subnode = mobile.querySelector('[data-sect-cart=' + index01 + ']');
        subnode = subnode.querySelector('.wrpRow');
        subnode = subnode.querySelector('div');
        subnode.innerText = infoFromStock[index01].toString();
      }

      if ((index01 !== 'count') && (index01 !== 'units') && (index01 !== 'src') && (index01 !== 'total')) {
        /* fill data to  other nodes */
        /* get a nested elem */
        subnode = mobile.querySelector('[data-sect-cart=' + index01 + ']');
        subnode.innerText = infoFromStock[index01];
      }
    }
  }
  return {
    regCallback: function (f) {
      callbackF = f;
    },
    updateItem: function (idVal) {
      fillInfoIntoNodes(parent, idVal);
    }
  };
}

/* event dispatcher */
function EventDispatcher (pNode) {
  var parNode = pNode;
  var callbackFunc = null;
  function onClick (ev) {
    var reg = /[A-Za-z_0-9]\w+/g;
    var result = {};
    var keyCommandStr = ev.currentTarget.attributes[0].nodeValue;
    var key = reg.exec(keyCommandStr)[0];
    result[key] = reg.exec(keyCommandStr)[0];
    if (callbackFunc) {
      callbackFunc(result);
    }
  }

  return {
    registerCallback: function (f) {
      callbackFunc = f;
    },
    bindButtons: function (id) {
      /* select LI item with specified id */
      var liNode = parNode.querySelector('[data-item-id=' + id + ']');
      /* get list of buttons in an item */
      var btnList = liNode.getElementsByTagName('button');
      btnList = Array.prototype.slice.call(btnList);
      /* bind buttons to an eventListener */
      btnList.forEach(function (value, index) {
        value.addEventListener('click', onClick, false);
      });
    },
    unbindButtons: function (id) {
      /* select LI item with specified id */
      var liNode = parNode.querySelector('[data-item-id=' + id + ']');
      /* get list of buttons in an item */
      var btnList = liNode.getElementsByTagName('button');
      btnList = Array.prototype.slice.call(btnList);
      /* unbind buttons to an eventListener */
      btnList.forEach(function (value, index) {
        value.removeEventListener('click', onClick);
      });
    }

  };
}

/* DomMgr - this class iplements 2 inerfaces:
1)input of useCase interactor - {key:counOfGoods,..}
2)callback function - pass parameter {idOfProduct:command}
If an item has been created - it only updates.
If the item isn`t exists - it has been created
If the item isn`t exists in data from Modell - it has been removed */
function DomMgr (pNodeClassId) {
  var sCalc = new SumCalc('orderSection', 'container');
  /* get parent node - i.e. list node */
  var parentNode = document.querySelector('.' + pNodeClassId);
  /* check - if a node exists */
  if (!parentNode) {
    return null;
  }

  var evDispatcher = new EventDispatcher(parentNode);
  var updater = new NodeUpdater(parentNode);
  var fabrica = new NodesFabrica(parentNode);
  /* set items in according to a modell data
    if node is excess - it will been deleted
    If node isn`t exists  - it will been created` */
  function setNodesByModellData (fromModell) {
    var iterableDOMlist = {};
    var tmp;
    var listOfDOM = parentNode.children;
    /* convert HTMLlist to object {key:node,..} */
    for (var q = 0; q < listOfDOM.length; q++) {
      /* get id */
      tmp = listOfDOM[q].attributes[0].nodeValue;
      /* assign node */
      iterableDOMlist[tmp] = listOfDOM[q];
    }

    /* if modell length > 0, clear proxy */
    if (Object.keys(fromModell).length > 0) {
      fabrica.setProxy(false);
    }

    /* 1)checking - is modell data exists in DOM? */
    for (var index in fromModell) {
      tmp = {};
      if (index in iterableDOMlist) {
        /* do nothing */
      } else {
        /* create new item */
        tmp[index] = fromModell[index];
        fabrica.createItemByKeyValue(tmp);
        evDispatcher.bindButtons(index);
      }
    }

    /* 2)checking - is DOMitem exists in Modell data? */
    for (var index01 in iterableDOMlist) {
      if (index01 in fromModell) {
        /* do nothing */
      } else {
        /* remove an excess item */
        evDispatcher.unbindButtons(index01);
        fabrica.removeItemFromDom(index01);
      }
    }
    /* if modell length = 0, set proxy */
    if (Object.keys(fromModell).length === 0) {
      fabrica.setProxy(true);
    }
  }

  return {
    /* a callback for queries to stock - full info about an item */
    regStockCallback: function (f) {
      updater.regCallback(f);
    },
    /* commands to UseCase interactor: parameter{id:command} */
    regCommandCallback: function (f) {
      evDispatcher.registerCallback(f);
    },
    useCaseInput: function (keyValList) {
      var tmp;
      /* add new items in DOM or remove excees items */
      setNodesByModellData(keyValList);
      /* update nodes */
      for (var index in keyValList) {
        /* clear */
        tmp = {};
        /* assign kay and value */
        tmp[index] = keyValList[index];
        /* update */
        updater.updateItem(tmp);
      }
      return sCalc.calculateSum();
    }

  };
}

/* summ calc - calculate sum and grand sum */
function SumCalc (orderNodeClass, listNodeClass) {
  var parent = document.querySelector('.' + orderNodeClass);
  var list = document.querySelector('.' + listNodeClass);
  var grandCoef = 0.9;
  var tmp;
  return {
    calculateSum: function () {
      var sum = 0;
      var grSum = 0;
      /* get node list */
      var liArray = list.children;
      liArray = Array.prototype.slice.call(liArray);
      /* calculate sum of all the nodes */
      liArray.forEach(function (value, index) {
        /* sum + */tmp = value.querySelector('.desktopVarCartItem');
        tmp = tmp.querySelector('[data-sect-cart="total"]');
        sum += parseFloat(tmp.innerText);
        grSum += parseFloat(tmp.innerText) * grandCoef;
      });
      /* assign value to nodes: subtotal, grandTotal */
      tmp = parent.querySelector('[data-section-id="subtotal"]');
      tmp.innerText = '$' + sum;
      tmp = parent.querySelector('[data-section-id="grandtotal"]');
      tmp.innerText = '$' + grSum;
      return { sum: sum, grandsum: grSum };
    }
  };
}
/* use case */
function UseCase (btnAttrID) {
  var chOutProc = null;
  var checkoutBtn;
  const MAX_ITEM_COUNT = 25;
  var domM = new DomMgr('container');
  var mod = new Modell('myCartStorage123465789');
  mod.registerNotifier(onUpdateModell);
  var modItem;
  domM.regCommandCallback(onCommand);

  function startApp (modell, dommanager) {
    var cart = modell.getData();
    dommanager.useCaseInput(cart);
  }
  function onCheckout (msg) {
    var resp = mod.getData();
    chOutProc(resp);
  }
  function onUpdateModell () {
    var allModell = mod.getData();
    domM.useCaseInput(allModell);
  }

  function onCommand (idCmd) {
    var id = Object.keys(idCmd)[0];
    var command = idCmd[id];
    /* get info from modell */
    modItem = mod.getDataByKey(id);
    switch (command) {
      case 'plus':
        /* add 1 */
        modItem[id] = modItem[id] + 1;
        /* has maximal count of item been reached? */
        if (modItem[id] > MAX_ITEM_COUNT) {
          alert('please call to wholesale department');
          return;
        }
        mod.putData(modItem);
        break;
      case 'minus':
        /* substract 1 */
        modItem[id] = modItem[id] - 1;
        /* has maximal count of item been reached? */
        if (modItem[id] === 0) {
          mod.removeData(id);
        } else {
          mod.putData(modItem);
        }
        break;
      case 'remove':
        mod.removeData(id);
        break;
    }
  }

  return {
    regStockInterface: function (f) {
      domM.regStockCallback(f);
    },
    regCheckOutProc: function (f) {
      if (!chOutProc) {
        chOutProc = f;
        /* get check out button and add an event listener */
        checkoutBtn = document.querySelector('[data-btn=' + btnAttrID + ']');
        checkoutBtn.addEventListener('click', onCheckout);
      }
    },
    start: function () {
      startApp(mod, domM);
    }

  };
}

function stCallback (id) {
  var tmp;
  var response;
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
  tmp = goodsInfo[id];
  response = Object.assign({}, tmp);
  delete response.keys;
  delete response.image;
  return response;
}
function tst001 (arg) {
  var str = '';
  for (var key in arg) {
    str += `${key} : ${arg[key]}\n`;
  }

  alert(str);
}
var useC;

window.onload = function () {
  useC = new UseCase('checkout');
  useC.regStockInterface(stCallback);
  useC.regCheckOutProc(tst001);
  useC.start();
};
