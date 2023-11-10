// src/App.js

import React, { useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';

// Initialize web3 instance
const web3 = new Web3(Web3.givenProvider);

const App = () => {
    const [account, setAccount] = useState(null); // State to store user's account
    const [data, setData] = useState(''); // State to store user input data
    const [accessCode, setAccessCode] = useState(''); // State to store the generated access code
    const [fetchedData, setFetchedData] = useState(null); // To access data of someone using the access code

    // Function to handle account connection
    const connectWalletHandler = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    };

    // Function to handle data submission
    const submitDataHandler = async (event) => {
        event.preventDefault();
        // Call the backend to store the data
        try {
            const response = await axios.post('http://localhost:8080/register', {
                userAddress: account,
                userData: data,
                userAccessCode: accessCode,
            });
            console.log('Data submitted:', response.data);
            // Reset data input
            setData('');
        } catch (error) {
            console.error('Error submitting data:', error);
            // Handle errors here, such as displaying a notification to the user
        }
    };

    // Function for access code generation - calls the backend which interacts with the smart contract
    const generateAccessCodeHandler = async () => {
        try {
            const response = await axios.post('http://localhost:8080/generate-access-code', {
                userAddress: account,
            });
            setAccessCode(response.data.accessCode);
        } catch (error) {
            console.error('Error generating access code:', error);
            // Handle errors here
        }
    };

    // Function to fetch data using the access code
const fetchDataHandler = async () => {
  try {
      const response = await axios.get(`http://localhost:8080/fetch-data?accessCode=${accessCode}`);
      // Update state with the fetched data
      setFetchedData(response.data.dataHash); // Assuming 'dataHash' is the key in response JSON containing the data
  } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors here, such as updating the state to display an error message
      setFetchedData("Error fetching data. Please try again."); // You can set a state to show error or a message directly
  }
};

return (
  <div>
      <h1>Healthcare Emergency Data App</h1>
      {!account ? (
          <button onClick={connectWalletHandler}>Connect to MetaMask</button>
      ) : (
          <div>
              <p>Connected Account: {account}</p>
              <form onSubmit={submitDataHandler}>
                  <input
                      type="text"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      placeholder="Enter your emergency data"
                  />
                  <button type="submit">Submit Data</button>
              </form>
              <button onClick={generateAccessCodeHandler}>Generate Access Code</button>
              <div>
                  <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code to fetch data"
                  />
                  <button onClick={fetchDataHandler}>Fetch Data</button>
                  {fetchedData && <p>Fetched Data: {fetchedData}</p>}
              </div>
          </div>
      )}
  </div>
);

};

export default App;
