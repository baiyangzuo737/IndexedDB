const dbName = 'firstDB',
      messageListDom = document.getElementById('list')
let messageList = [],
    request, db, liString
(function() {
  'use strict'
  if (!('indexedDB' in window)) {
    alert('Your browser doesn\'t support a stable version of IndexedDB.')
    return
  }
  request = window.indexedDB.open(dbName, 1)
})()

request.onerror = function(event) { 
  //错误处理
  console.error('数据库异常')
}
request.onsuccess = function(event) { 
  //成功
  db = request.result //获取数据库对象
  getMessages()
}
request.onupgradeneeded = function(event) { 
  //版本变更
  db = event.target.result //更新数据库对象
  let objectStore
  if(!db.objectStoreNames.contains('message')) { //检查是否存在message 
    objectStore = db.createObjectStore('message',{ autoIncrement: true } ) 
    objectStore.createIndex('time', 'time', { unique: true }) 
    objectStore.createIndex('content', 'content', { unique: false })
    //不存在则创建message keyPath主动设置主键 { keyPath: 'id' } autoIncrement自动生成主键
    //新建索引 参数分别为索引名称、索引所在的属性、配置对象 unique是否允许重复值
  }
}
// 数据操作 通过事物 增删改查 
function writeData(params) {
  //创建事物 第一个参数 涉及的objectStore 第二个参数 操作类型 可省略 默认只读 readonly只读  readwrite读写
  let req = db
    .transaction(['message'], 'readwrite')
    .objectStore('message')
    .add(params)
  req.onsuccess = function (event) {
    console.info('写入成功')
    readAllData()
  }
  req.onerror = function (event) {    
    console.error('写入失败: ' + event.srcElement.error.message )
  }
}
function readData() {
  let transaction = db.transaction(['message']),
      objectStore = transaction.objectStore('message'),
      req = objectStore.get(1)
  req.onsuccess = function() {
    if(req.result) {
      console.log(req.result)
    }
  }
  req.onerror = function() {
    console.error('读取失败')
  }
}
function findData(key, value) {
  let transaction = db.transaction(['message'], 'readonly'),
      store = transaction.objectStore('message'),
      index = store.index(key),
      req = index.get(value)
  req.onsuccess = function(event) {
    let result = event.target.result
    if(result) {
      console.log(result)
    }
  }
}
function traversalData() {
  let objectStore = db.transaction('message').objectStore('message')
  // openCursor(range, direction) range 对象来限制被检索的项目的范围, direction可以指定你希望进行迭代的方向
  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result
    if(cursor) {
      messageList.push(cursor.value)
      cursor.continue()
    }
    else {
      console.info('获取完毕')
    }
  }
}
function readAllData() {
  //一次性获取全部数据
  let objectStore = db.transaction('message').objectStore('message'),
      allRecords = objectStore.getAll()
  allRecords.onsuccess = function() {
    messageList = allRecords.result
    updateMessageList()
  }
}
function updateData(params) {
  let req = db
  .transaction(['message'], 'readwrite')
  .objectStore('message')
  .put(params)
  req.onsuccess = function(event) {
    // 数据已更新
  }
  req.onerror = function(event) {
    // 错误处理
  }
}
function deleteData(key) {
  let req = db
  .transaction(['message'], 'readwrite')
  .objectStore('message')
  .delete(key)
  req.onsuccess = function(event) {
    console.info('数据删除成功')
  }

}

function updateMessageList() {
  liString = ''
  messageList.forEach((item)=>{
    liString += "<li class='message'>"+item.content+"</li>"
  })
  messageListDom.innerHTML = liString
}
function getMessages() {
  readAllData()
}
function sendMessage() {
  let params = {
    content: document.getElementById('info').value,
    time: new Date().getTime()
  }
  params.content ? writeData(params) : null
  
}
