/** @jsx React.DOM */


//var component = React.addons.TestUtils.renderIntoDocument(window.Notice({ message: "show me the message" }));
//expect(component.getDOMNode().childNodes[0].className).toBe('notice');

var ReactTestUtils;

describe("Welcome/Initial State", function() {
  beforeEach(function() {
    ReactTestUtils = React.addons.TestUtils;
  });

  it("Check Text Assignment", function() {
    var label = <Welcome>Some Text We Need for Test</Welcome>;
    ReactTestUtils.renderIntoDocument(label);
    expect(label.refs.p).toBeDefined();
    expect(label.refs.p.props.children).toBe("Some Text We Need for Test")
  });

  it("Click", function() {
    var label = <Label>Some Text We Need to Test</Label>;
    ReactTestUtils.renderIntoDocument(label);

    ReactTestUtils.Simulate.click(label.refs.p);
    expect(label.refs.p.props.children).toBe("Text After Click");
  });

});