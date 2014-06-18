/** @jsx React.DOM */

var _ = require('lodash');
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var md = require('html-md');
var gui = require('nw.gui');

//var flow = new EventEmitter();
//
//document.getElementById('openBlog').addEventListener('click', function() {
//  var chooser = document.getElementById('fileDialog');
//  chooser.addEventListener('change', function() {
//    var blogDir = this.value;
//    flow.emit('startJekyll', blogDir);
//    flow.emit('getMarkdownFiles', blogDir);
//  });
//  chooser.click();
//});
//
//function getUrl() {
//  var path = document.getElementsByTagName('iframe')[0].contentWindow.location.pathname;
//  flow.emit('iframeUrl', path);
//}
//
//flow.on('loading', function() {
//  document.getElementById('home').innerHTML = '<h2 class="text-center">Loading...</h2>';
//});
//
//flow.on('editMode', function() {
//  console.log('EDIT MODE IS ON');
//  document.getElementById('savePost').classList.remove('hidden');
//  document.getElementById('publishPost').classList.remove('hidden');
//});
//
//flow.on('startHttpServer', function(path) {
//  var server = spawn('node', ['node_modules/http-server/bin/http-server', path + '/_site']);
//
//  server.stdout.once('data', function (data) {
//    console.log('stdout: ' + data);
//    var url = 'http://localhost:8080';
//    document.querySelector('body').classList.remove('cover');
//    document.getElementById('main').innerHTML = '<iframe onload="getUrl()" src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>';
//    flow.emit('showTopBar');
//    flow.emit('getMarkdownFiles');
//  });
//
//  server.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
//  });
//
//  server.on('close', function (code) {
//    console.log('child process exited with code ' + code);
//  });
//});
//
//flow.on('startJekyll', function(source) {
//  flow.emit('loading');
//  var child = exec('jekyll build -s ' + source, function(err, stdout, stderr) {
//    console.log(stdout);
//    flow.emit('startHttpServer', source);
//  });
//});
//
//flow.on('showTopBar', function() {
//  document.querySelector('.fixed').classList.remove('hidden');
//});
//
//flow.on('getMarkdownFiles', function(path) {
//  fs.readdir(path + '/_posts', function(err, files) {
//
//    if (!files) {
//      alert('No posts found');
//    }
//
//    var posts = _.filter(files, function(file) {
//      var extension = file.split('.').pop();
//      return extension === 'md' || extension === 'markdown'
//    });
//
//    flow.emit('checkIfInEditMode', posts);
//  });
//});
//
//
//flow.on('checkIfInEditMode', function(posts) {
//  flow.on('iframeUrl', function(url) {
//    console.log(posts);
//    console.log(url);
//
//    var url = url.replace(/\//g, '');
//    var posts = _.map(posts, function(post) { return post.split('-').slice(3).join('-').split('.').shift() });
//  });
//});

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

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Home = React.createClass({
  getInitialState: function() {
    return {
      loading: ''
    }
  },
  componentDidMount: function() {
    console.log('component mounted')
    if (!this.props.blogDidLoad) {
      this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
      this.refs.fileDialog.getDOMNode().addEventListener('change', this.updatePath);
    }
  },
  componentDidUpdate: function() {
    console.log('component updated');
    if (this.props.blogDidLoad) {
      console.log(this.refs.iframe.getDOMNode());
      this.refs.iframe.getDOMNode().setAttribute('onload', 'getUrl()');

    }
  },
  handleBlogDidLoad: function(value) {
    this.props.updateBlogDidLoad(value);
  },
  handleClick: function() {
    this.refs.fileDialog.getDOMNode().click();
  },
  handleUpdatePosts: function(path) {
    var files = fs.readdirSync(path + '/_posts');

    var posts = _.filter(files, function(file) {
      var extension = file.split('.').pop();
      return extension === 'md' || extension === 'markdown'
    });

    this.props.updatePosts(posts);
  },
  updatePath: function(e) {
    this.props.updatePath(e.target.value);

    this.setState({
      loading: 'Loading...'
    });

    var jekyll = spawn('jekyll', ['serve', '--watch', '-s', e.target.value]);

    jekyll.stdout.once('data', function (data) {
      console.log('stdout: ' + data);
    }.bind(this));
    jekyll.stdout.on('data', function (data) {
      var target = 'Server running...';
      var target2 = 'Address already in use';
      var line = data.toString();
      if (line.match(target) && line.match(target).length) {
        this.handleBlogDidLoad(true);
      } else if (line.match(target2) && line.match(target2).length) {
        this.handleBlogDidLoad(true);
      }
    }.bind(this));
    jekyll.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    jekyll.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });

    process.on('exit', function() {
      jekyll.kill();
    });

    var win = gui.Window.get();

    win.on('close', function() {
      jekyll.kill();
      this.close(true);
    });

    this.handleUpdatePosts(e.target.value);
  },
  getUrl: function() {

  },
  render: function() {
    var view = null;

    if (this.props.blogDidLoad) {
      document.body.classList.remove('cover');
      view = (
        <div>
          <Topbar blogDidLoad={this.props.blogDidLoad} editMode={this.props.editMode} />
          <iframe ref="iframe" onLoad={this.getUrl} src={this.props.url} width="100%" height="100%" frameBorder="0"></iframe>
        </div>
      );
    } else {
      view = (
        <div className="home">
          <button ref="openBlog" onClick={this.handleClick} className="btn outline">Open Blog</button>
          <input ref="fileDialog" type="file" className="hidden" />
          <h5>{this.state.loading}</h5>
          <h4>Select a local Jekyll blog</h4>
        </div>
      );
    }

    return <div>{view}</div>;
  }
});

var Frame = React.createClass({

  render: function() {
    return <iframe />
  },
  componentDidMount: function() {
    this.renderFrameContent();
  },
  renderFrameContents: function() {
    var doc = this.getDOMNode().contentDocument;
    if (doc.readyState === 'complete') {
      React.renderComponent(this.props.children, doc.body);
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
  },
  componentDidUpdate: function() {
    this.renderFrameContents();
  },
  componentWillUnmount: function() {
    React.unmountComponentAtNode(this.getDOMNode().contentDocument);
  }
});

var Topbar = React.createClass({
  render: function() {
    var html = null;
    if (this.props.editMode) {
      html = (
        <div className="fixed">
          <nav className="top-bar">
            <section className="top-bar-section">
              <ul className="left">
                <li id="newPost"><a href="#"><i className="fa fa-file-text"></i> New Post</a></li>
                <li id="savePost"><a href="#"><i className="fa fa-floppy-o"></i> Save</a></li>
                <li id="publishPost"><a href="#"><i className="fa fa-github"></i> Publish</a></li>
              </ul>
              <ul className="right">
                <li id="closeBlog"><a href="#">Close</a></li>
              </ul>
            </section>
          </nav>
        </div>
        );
    } else {
      html = (
        <div className="fixed">
          <nav className="top-bar">
            <section className="top-bar-section">
              <ul className="left">
                <li id="newPost"><a href="#"><i className="fa fa-file-text"></i> New Post</a></li>
              </ul>
              <ul className="right">
                <li id="closeBlog"><a href="#">Close</a></li>
              </ul>
            </section>
          </nav>
        </div>
        );
    }


    return (
      <div>{html}</div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      blogDidLoad: false,
      editMode: false,
      path: '',
      url: 'http://localhost:4000',
      posts: []
    }
  },
  updatePath: function(path) {
    this.setState({
      path: path
    });
  },
  updatePosts: function(posts) {
    this.setState({
      posts: posts
    });
  },
  updateBlogDidLoad: function(value) {
    this.setState({
      blogDidLoad: value
    })
  },
  render: function() {
    return (
      <div>
        <Home
          blogDidLoad={this.state.blogDidLoad}
          updateBlogDidLoad={this.updateBlogDidLoad}
          editMode={this.state.editMode}
          updatePath={this.updatePath}
          updatePosts={this.updatePosts}
          path={this.state.path}
          url={this.state.url}
          posts={this.state.posts}
        />
      </div>
    );
  }
});

React.renderComponent(
  <App />,
  document.body
);
