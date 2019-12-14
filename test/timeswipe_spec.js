const should = require("should");
const helper = require("node-red-test-helper");
const timeswipeNode = require("../timeswipe");

// https://nodered.org/docs/creating-nodes/first-node#unit-testing
describe("lower-case Node", function() {
  afterEach(function() {
    helper.unload();
  });

  it("should be loaded", function(done) {
    var flow = [{ id: "n1", type: "lower-case", name: "test name" }];
    helper.load(lowerNode, flow, function() {
      var n1 = helper.getNode("n1");
      n1.should.have.property("name", "test name");
      done();
    });
  });
});
