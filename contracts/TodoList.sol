pragma solidity ^0.5.0;

contract TodoList{
  //declare a state variable
  //State variables are written to Blockchain
  //it represents the state of this smart contract
  //the state variable below counts the tasks currently being initiated in the todoList
  uint public taskCount = 0;

  struct Task{
    uint id;
    string content;
    bool completed;
  }

  //a key-value pair
  mapping(uint => Task) public tasks;

  //Event is an inheritable member of a contracts
  //event is emmitted and it stores the argumants passed in the transaction logs
  //the logs are stored on blockchain and are accessbile using address of the contract until the contract is present on blockchain
  event TaskCreated(
    uint id,
    string content,
    bool completed
  );

  event TaskCompleted(
    uint id,
    bool completed
  );


  constructor() public{
    //for the very first time, instead of showing empty list, show a default item
    createTask("Enter an item like this to start tracking your todos!");
  }

  function createTask(string memory _content) public{
    taskCount++;
    tasks[taskCount] =  Task(taskCount, _content, false); //creating a key-value pari in tasks to store the new tasks
    //new tasks are always incomplete, se we set completed as false

    //create a function with the task created parameters
    //which can then be subscribed in the client side application
    emit TaskCreated(taskCount, _content, false);

  }

  //underscore means it is local variable
  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }

}
