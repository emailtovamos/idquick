// src/App.js

import React, { useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import './App.css';

// Initialize web3 instance
const web3 = new Web3(Web3.givenProvider);
var backendurl = 'https://idquick-backend-satodas-dev.apps.sandbox-m2.ll9k.p1.openshiftapps.com'
// backendurl = 'http://localhost:8080'

const App = () => {
    const [account, setAccount] = useState(null); // State to store user's account
    const [data, setData] = useState(''); // State to store user input data
    // Use a state object to store multiple pieces of data
    const [formData, setFormData] = useState({
      name: '',
      dob: '',
      address: '',
      nationality: '',
      miscellaneous: '',
    });
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

    // Modify this function to send an object with all form data
  const submitDataHandler = async (event) => {
    event.preventDefault();
    const combinedData = `Name: ${formData.name}|DOB: ${formData.dob}|Address: ${formData.address}|Nationality: ${formData.nationality}|Miscellaneous: ${formData.miscellaneous}`;
    try {
      const response = await axios.post(backendurl + '/register', {
        userAddress: account,
        userData: combinedData,
        userAccessCode: accessCode,
      });
      console.log('Data submitted:', response.data);
      setFormData({ name: '', dob: '', address: '', nationality: '', miscellaneous: '' }); // Reset form data
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  // Handle change for each input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

    // Function for access code generation - calls the backend which interacts with the smart contract
    const generateAccessCodeHandler = async () => {
        try {
            const response = await axios.post(backendurl +'/generate-access-code', {
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
      const response = await axios.get(backendurl +`/fetch-data?accessCode=${accessCode}`);
      // Update state with the fetched data
      setFetchedData(response.data.dataHash); // Assuming 'dataHash' is the key in response JSON containing the data
  } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors here, such as updating the state to display an error message
      setFetchedData("Error fetching data. Please try again."); // You can set a state to show error or a message directly
  }
};

return (
  <div className="app-container">
      <header className="app-header">
        <h1>Healthcare Emergency Data App</h1>
      </header>
      {!account ? (
          <button className="connect-button" onClick={connectWalletHandler}>
            Connect to MetaMask
          </button>
      ) : (
          <div className="content">
              <div className="account-info">
                <p>Connected Account: {account}</p>
              </div>
              <form onSubmit={submitDataHandler} className="data-form">
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                />
                <input
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  placeholder="Date of Birth"
                  type="date"
                />
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
                <input
                  name="nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="Nationality"
                />
                <input
                  name="miscellaneous"
                  type="text"
                  value={formData.miscellaneous}
                  onChange={handleChange}
                  placeholder="Miscellaneous"
                />
                <button type="submit">Submit Data</button>
              </form>
              <button className="access-code-button" onClick={generateAccessCodeHandler}>
                Generate Access Code
              </button>
              <div className="fetch-section">
                  <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code to fetch data"
                      className="access-code-input"
                  />
                  <button className="fetch-button" onClick={fetchDataHandler}>Fetch Data</button>
              </div>
              {fetchedData && <div className="fetched-data"><p>{fetchedData}</p></div>}
          </div>
      )}
  </div>
);

};

export default App;
