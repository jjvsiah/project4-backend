import { Data } from './interface';
import fs from 'fs';

const FILE_PATH = './src/dataStoring.json';
// YOU SHOULD MODIFY THIS OBJECT BELOW

let data: Data = {
  globalOwnersId: [],
  users: [],
  channels: [],
  messages: [],
  dms: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use getData() to access the data
function getData() {
  return data;
}

function reloadData() {
  if (fs.existsSync(FILE_PATH)) {
    const storedData = fs.readFileSync(FILE_PATH, { flag: 'r' });
    const reloadData = JSON.parse(storedData.toString());
    setData(reloadData);
  }

  setData(data);
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
// function setData(newData: Data) {
//   data = newData;
// }

function setData(newData: Data) {
  data = newData;
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(FILE_PATH, jsonData, { flag: 'w' });
}

export { getData, setData, reloadData };
