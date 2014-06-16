var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var md = require('html-md');
var _ = require('lodash');
var gui = require('nw.gui');
//
//// Open a new window.
//var win = gui.Window.get();
//
//// Release the 'win' object here after the new window is closed.
//win.on('closed', function() {
//  win = null;
//});
//
//// Listen to main window's close event
//gui.Window.get().on('close', function() {
//  // Hide the window to give user the feeling of closing immediately
//  this.hide();
//
//  // If the new window is still open then close it.
//  if (win != null)
//    win.close(true);
//
//  // After closing the new window, close the main window.
//  this.close(true);
//});



var flow = new EventEmitter();

document.getElementById('openBlog').addEventListener('click', function() {
  var chooser = document.getElementById('fileDialog');
  chooser.addEventListener('change', function() {
    var blogDir = this.value;
    flow.emit('startJekyll', blogDir);
    flow.emit('getMarkdownFiles', blogDir);
  });
  chooser.click();
});

flow.on('loading', function() {
  document.getElementById('home').innerHTML = '<h2 class="text-center">Loading...</h2>';
});

flow.on('editMode', function() {
  console.log('EDIT MODE IS ON');
  document.getElementById('savePost').innerHTML = '<iframe onload="getUrl()" src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>';
  document.getElementById('publishPost').innerHTML = '<iframe onload="getUrl()" src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>';
});

flow.on('startHttpServer', function(source) {

  var getUrl = function() {
    console.log(document.getElementsByTagName('iframe')[0].contentWindow.location.pathname);
    flow.emit('editMode');
  };

  var server = spawn('node', ['node_modules/http-server/bin/http-server', source + '/_site']);

  server.stdout.once('data', function (data) {
    console.log('stdout: ' + data);
    var url = 'http://localhost:8080';
    document.querySelector('body').classList.remove('cover');
    document.getElementById('main').innerHTML = '<iframe onload="getUrl()" src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>';

    flow.emit('show-top-bar');
  });

  server.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  server.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
});

flow.on('startJekyll', function(source) {
  flow.emit('loading');
  var child = exec('jekyll build -s ' + source, function(err, stdout, stderr) {
    console.log(stdout);
    flow.emit('startHttpServer', source);
  });
});

flow.on('showTopBar', function() {
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


