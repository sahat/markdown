/** @jsx React.DOM */

var yaml = require('js-yaml');


var ModalDialog = React.createClass({
  hide: function() {
    $(this.getDOMNode()).foundation('reveal', 'close');
  },
  show: function() {
    $(this.getDOMNode()).foundation('reveal', 'open');
  },
  handleSubmit: function() {
    var data = {
      layout: this.refs.layout.getDOMNode().value,
      title: this.refs.title.getDOMNode().value,
      excerpt: this.refs.excerpt.getDOMNode().value,
      image: this.refs.image.getDOMNode().value
    };
    this.props.updateFrontMatter(data);
    this.hide();
    return false;
  },
  render: function() {
    if (this.props.frontMatter) {
      var frontMatter = yaml.load(this.props.frontMatter);
      var inputFields = [];
      for (var key in frontMatter) {
        if (frontMatter.hasOwnProperty(key)) {
          inputFields.push(
            <label>{key}
              <input ref="{key}" type="text" defaultValue={frontMatter[key]} />
            </label>
          );
        }
      }
      return (
        <div className="reveal-modal" data-reveal>
          <form onSubmit={this.handleSubmit}>
          {inputFields}
            <button type="submit" className="small">Update</button>
          </form>
          <a className="close-reveal-modal">&#215;</a>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
});
