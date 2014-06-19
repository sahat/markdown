/** @jsx React.DOM */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var http = require('http');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');
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


var Home = React.createClass({

  componentDidMount: function() {
    this.refs.fileDialog.getDOMNode().setAttribute('nwdirectory', '');
    this.refs.fileDialog.getDOMNode().addEventListener('change', this.updatePath);
  },

  componentDidUpdate: function() {
    if (this.props.blogDidLoad) {
      this.refs.myIframe.getDOMNode().addEventListener('load', this.iframeLoaded, true);
    }
  },
  iframeLoaded: function() {
    console.log('calling');
    var path = this.refs.myIframe.getDOMNode().contentWindow.location.pathname;
    var url = path.replace(/\//g, '');
    console.log(url);
    var posts = _.map(this.props.posts, function(post) { return post.split('-').slice(3).join('-').split('.').shift() });
    console.log(posts);
    if (_.contains(posts, url)) {
      this.props.setEditMode(true);
      var container = this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByClassName('post-content')[0];
      container.style.outline = 'none';
      var editor = new Pen(container);

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

    var jekyll = spawn('jekyll', ['serve', '--watch', '-s', e.target.value]);

    jekyll.stdout.on('data', function (data) {
      var line = data.toString();
      var serverRunning = 'Server running...';
      var portInUse = 'Address already in use';
      if (line.match(serverRunning) && line.match(serverRunning).length ||
        line.match(portInUse) && line.match(portInUse).length) {
        this.handleBlogDidLoad(true);
      }
    }.bind(this));

    process.on('exit', function() {
      jekyll.kill();
    });

    this.handleUpdatePosts(e.target.value);
  },
  save: function() {
    var postsDir = path.join(this.props.path, '_posts');
    var location = this.refs.myIframe.getDOMNode().contentWindow.location.pathname;
    var postSlug = location.replace(/\//g, '');
    var container = this.refs.myIframe.getDOMNode().contentWindow.document.getElementsByClassName('post-content')[0];
    var markdown = md(container.innerHTML, { inline:true });
    _.each(this.props.posts, function(postFile) {
      if (postFile.match(postSlug)) {
        console.log(postFile);
        var file = fs.readFileSync(path.join(postsDir, postFile), 'utf8');
        file = file.split('---');
        file[2] = markdown;
        file.join('---');
        fs.writeFileSync(path.join(postsDir, postFile), file);
        console.log('File saved');
      }
    });
  },
  render: function() {
    var view = null;

    if (this.props.blogDidLoad) {
      document.body.classList.remove('cover');
      view = (
        <div>
          <Topbar
            save={this.save}
            updateBlogDidLoad={this.props.updateBlogDidLoad}
            blogDidLoad={this.props.blogDidLoad}
            setEditMode={this.props.setEditMode}
            editMode={this.props.editMode}
          />
          <iframe ref="myIframe" src={this.props.url} width="100%" height="100%" frameBorder="0"></iframe>
        </div>
        );
    } else {
      view = (
        <div className="home">
          <button ref="openBlog" onClick={this.handleClick} className="btn outline">Open Blog</button>
          <input ref="fileDialog" type="file" className="hidden" />
          <h4>Select a local Jekyll blog</h4>
        </div>
      );
    }

    return <div>{view}</div>;
  }
});

var Topbar = React.createClass({
  handleCloseBlogClick: function(e) {
    this.props.updateBlogDidLoad(false);
    this.props.setEditMode(false);
    document.body.classList.add('cover');
  },
  handleSaveClick: function(e) {
    this.props.save();
  },
  render: function() {
    var view = null;
    if (this.props.editMode) {
      view = (
        <div className="fixed">
          <nav className="top-bar">
            <section className="top-bar-section">
              <ul className="left">
                <li id="newPost"><a href="#"><i className="fa fa-file-text"></i> New Post</a></li>
                <li><a onClick={this.handleSaveClick} href="#"><i className="fa fa-floppy-o"></i> Save</a></li>
                <li id="publishPost"><a href="#"><i className="fa fa-github"></i> Publish</a></li>
              </ul>
              <ul className="right">
                <li><a onClick={this.handleCloseBlogClick} href="#">Close</a></li>
              </ul>
            </section>
          </nav>
        </div>
      );
    } else {
      view = (
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
    return <div>{view}</div>;
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
  setEditMode: function(value) {
    this.setState({
      editMode: value
    });
  },
  render: function() {
    return (
      <div>
        <Home
          setEditMode={this.setEditMode}
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
