// const TodoList = artifacts.require("./TodoList.sol");
//
// module.exports = function(deployer) {
//   deployer.deploy(TodoList);
// };

var TodoList = artifacts.require("./TodoList.sol");

module.exports = function(deployer) {
  deployer.deploy(TodoList);
};
