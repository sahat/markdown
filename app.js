var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var md = require('html-md');
var _ = require('lodash');
var gui = require('nw.gui');

// Open a new window.
var win = gui.Window.get();

// Release the 'win' object here after the new window is closed.
win.on('closed', function() {
  win = null;
});

// Listen to main window's close event
gui.Window.get().on('close', function() {
  // Hide the window to give user the feeling of closing immediately
  this.hide();

  // If the new window is still open then close it.
  if (win != null)
    win.close(true);

  // After closing the new window, close the main window.
  this.close(true);
});

$('iframe').load(function() {
  console.log(document.getElementsByTagName('iframe').contentWindow.location.pathname);
});

var flow = new EventEmitter();

document.getElementById('openBlog').addEventListener('click', function() {
  var chooser = document.getElementById('fileDialog');
  chooser.addEventListener('change', function() {
    var blogDir = this.value;
    flow.emit('start-jekyll', blogDir);
    flow.emit('getMarkdownFiles', blogDir);
  });
  chooser.click();
});

flow.on('loading', function() {
  document.getElementById('main').innerHTML = '<h2 class="text-center">Loading...</h2>';
});

flow.on('start-http-server', function(source) {

  var server = spawn('node', ['node_modules/http-server/bin/http-server', source + '/_site']);

  server.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    document.getElementById('main').innerHTML = '<iframe src="http://localhost:' + 8080 + '" width="100%" height="100%" frameborder="0"></iframe>';
    flow.emit('show-top-bar');
  });

  server.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  server.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
});

flow.on('start-jekyll', function(source) {
  flow.emit('loading');
  var child = exec('jekyll build -s ' + source, function(err, stdout, stderr) {
    console.log(stdout);
    flow.emit('start-http-server', source);
  });
});

flow.on('show-top-bar', function() {
  document.querySelector('.fixed').classList.remove('hidden');
});

flow.on('getMarkdownFiles', function(path) {
  fs.readdir(path + '/_posts', function(err, files) {

    if (!files) {
      alert('No posts found');
    }

    var posts = _.filter(files, function(file) {
      var extension = file.split('.').pop();
      return extension === 'md' || extension === 'markdown'
    });

//    flow.emit('readMarkdownFiles', path, posts);
  });
});

//flow.on('readMarkdownFiles', function(path, posts) {
//
//  var renderer = new marked.Renderer();
//
//  renderer.image = function(href, title, text) {
//    var out = '<img src="' + path + href + '" alt="' + text + '"';
//    if (title) {
//      out += ' title="' + title + '"';
//    }
//    out += this.options.xhtml ? '/>' : '>';
//    return out;
//  };
//
//  _.each(posts, function(post) {
//
//    var file = fs.readFileSync(path + '/_posts/' + post, 'utf8');
//
//    $('.highlight').each(function(index, element) {
//      console.log('found highlight');
//      var language = $(this).find('code').attr('class');
//      var text = $(this).text();
//      $(this).text('{% highlight js %}\n' + text + '\n{% endhighlight %}');
//    });
//
//    $('.side-nav').append('<li><a href="#">' + post + '</a></li>');
//    var html = marked(file, { renderer: renderer });
//    $('#editor').html(html);
//    var options = {
//      editor: document.getElementById('editor')
//    };
//    var editor = new Pen(options);
//  });
//
//});


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
