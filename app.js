var fs = require('fs');
var http = require('http');
var marked = require('marked');
var EventEmitter = require('events').EventEmitter;

var ee = new EventEmitter();

document.getElementById('openBlog').addEventListener('click', function() {
  var chooser = document.getElementById('fileDialog');
  chooser.addEventListener('change', function() {
    ee.emit('getMarkdownFiles', this.value);
    ee.emit('displayTopBar');
  });
  chooser.click();
});

ee.on('displayTopBar', function() {
  document.querySelector('.top-bar').classList.remove('hidden');
});

ee.on('getMarkdownFiles', function(path) {
  fs.readdir(path + '/_posts', function(err, files) {
    var posts = files.filter(function(file) {
      var extension = file.split('.').pop();
      return extension === 'md' || extension === 'markdown'
    });
    ee.emit('????', posts);
  });
});

ee.on()



fs.readFile("myblog/_posts/2014-06-11-welcome-to-jekyll.markdown", 'utf8', function(err, data) {

  var html = marked(data);

  console.log(html);

  $('#editor').html(html);

  var options = {
    editor: document.getElementById('editor')
  };

  var editor = new Pen(options);

});


//http.get('http://localhost:4000', function(err, data) {
//  $('#container').html(data);
//});


//
//// Load native UI library
//var gui = require('nw.gui');
//
//// Create an empty menu
//var menu = new gui.Menu();
//
//// Add some items with label
//menu.append(new gui.MenuItem({ label: 'Item A' }));
//menu.append(new gui.MenuItem({ label: 'Item B' }));
//menu.append(new gui.MenuItem({ type: 'separator' }));
//menu.append(new gui.MenuItem({ label: 'Item C' }));
//
//// Remove one item
//menu.removeAt(1);
//
//// Iterate menu's items
//for (var i = 0; i < menu.items.length; ++i) {
//  console.log(menu.items[i]);
//}
//
//// Add a item and bind a callback to item
//menu.append(new gui.MenuItem({
//  label: 'Click Me',
//  click: function() {
//    // Create element in html body
//    var element = document.createElement('div');
//    element.appendChild(document.createTextNode('Clicked OK'));
//    document.body.appendChild(element);
//  }
//}));
//
//// Popup as context menu
//document.body.addEventListener('contextmenu', function(ev) {
//  ev.preventDefault();
//  // Popup at place you click
//  menu.popup(ev.x, ev.y);
//  return false;
//}, false);
//
//// Get the current window
//var win = gui.Window.get();
//
//// Create a menubar for window menu
//var menubar = new gui.Menu({ type: 'menubar' });
//
//// Create a menuitem
//var sub1 = new gui.Menu();
//
//
//sub1.append(new gui.MenuItem({
//  label: 'Test1',
//  click: function() {
//    var element = document.createElement('div');
//    element.appendChild(document.createTextNode('Test 1'));
//    document.body.appendChild(element);
//  }
//}));
//
//// You can have submenu!
//menubar.append(new gui.MenuItem({ label: 'Sub1', submenu: sub1}));
//
////assign the menubar to window menu
//win.menu = menubar;
//
//// add a click event to an existing menuItem
//menu.items[0].click = function() {
//  console.log("CLICK");
//};
