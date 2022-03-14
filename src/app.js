// App = {
//     contracts: {},
//     loading: false,
//
//     load: async () => {
//         await App.loadWeb3();
//         await App.loadAccounts();
//         await App.loadContract();
//         await App.render();
//     },
//
//       // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
//     loadWeb3: async () => {
//          window.addEventListener('load', async () => {
//         // Modern dapp browsers...
//         if (window.ethereum) {
//             window.web3 = new Web3(ethereum);
//             console.log("Loaded....")
//             try {
//                 // Request account access if needed
//                 await ethereum.enable();
//                 // Acccounts now exposed
//                 web3.eth.sendTransaction({/* ... */});
//             } catch (error) {
//                 // User denied account access...
//             }
//         }
//         // Legacy dapp browsers...
//         else if (window.web3) {
//             window.web3 = new Web3(web3.currentProvider);
//             // Acccounts always exposed
//             web3.eth.sendTransaction({/* ... */});
//         }
//         // Non-dapp browsers...
//         else {
//             console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
//         }
//         });
//     },
//
//     loadAccounts: async () => {
//         // connect to all the accounts, we want index 0 since, its the first account
//         // the account we are connected to
//         App.account = await ethereum.request({ method: 'eth_accounts' });
//         console.log(App.account);
//     },
//
//     loadContract: async () => {
//         // create a JS version of the contracts
//         const todoList = await $.getJSON('TodoList.json')
//         App.contracts.TodoList = TruffleContract(todoList)
//         App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
//         // console.log(todoList);
//
//         // Hydrate the smart contract with values from the blockchain
//         App.todoList = await App.contracts.TodoList.deployed()
//     },
//
//     render: async () => {
//         if (App.loading) {
//             return;
//         }
//
//         // Update app loading state
//         App.setLoading(true)
//
//         // Render Account
//         $('#account').html(App.account)
//
//         // Render Tasks
//         await App.renderTasks()
//
//         // Update loading state
//         App.setLoading(false)
//         },
//
//
//     renderTasks: async () => {
//         // load all the tasks from the blockchain
//         const taskCount = await App.todoList.taskCount();
//         const $tackTemplate = $(".taskTemplate");
//
//         // render each of the tasks
//         for (var i = 1; i <= taskCount; i++){
//             const task = await App.todoList.tasks(i);
//             const task_id = task[0].toNumber();
//             const task_content = task[1];
//             const task_completed = task[2];
//
//             // Create the html for the task
//             const $newTaskTemplate = $tackTemplate.clone()
//             $newTaskTemplate.find('.content').html(task_content)
//             $newTaskTemplate.find('input')
//                             .prop('name', task_id)
//                             .prop('checked', task_completed)
//                             .on('click', App.toggleCompleted)
//
//             // Put the task in the correct list
//             if (task_completed) {
//                 $('#completedTaskList').append($newTaskTemplate)
//             } else {
//                 $('#taskList').append($newTaskTemplate)
//             }
//
//             // Show the task
//             $newTaskTemplate.show()
//         }
//
//     },
//
//
//     setLoading: (boolean) => {
//         App.loading = boolean;
//         const loader = $('#loader');
//         const content = $('#content');
//         if (boolean) {
//             loader.show();
//             content.hide();
//         } else {
//             loader.hide();
//             content.show();
//         }
//     },
//
//
//     createTask: async () => {
//         App.setLoading(true);
//         const content = $('#newTask').val();
//         await App.todoList.createTask(content, { from: App.account[0] });
//         window.location.reload();
//     },
//
//
//     toggleCompleted: async (e) => {
//         App.setLoading(true)
//         const taskId = e.target.name
//         await App.todoList.toggleCompleted(taskId, { from: App.account[0] });
//         window.location.reload()
//     },
//
//
//
// }
//
// $(() => {
//     $(window).load(() => {
//         App.load();
//     })
// })

App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },

  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    await App.todoList.createTask(content, { from: App.account[0] })
    window.location.reload()
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId, { from: App.account[0] })
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})
