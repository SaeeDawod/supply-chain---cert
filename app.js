// require('dotenv').config();
const { ethers } = require('ethers');

// Setup Ethereum Connection
const provider = new ethers.JsonRpcProvider('https://mynode-df54.eks-singapore.settlemint.com/sm_sat_48d4391c893a1edb');
const signer = new ethers.Wallet('0x40827a00450c6b318ccca305ae5138af00c48997e48cd300dcd0153bed61f6a4', provider);

// Contract Setup
const contractABI = [
    "function createLot(string lotType, string quantity, string operatorId, string originId, string lotNo, string transporterId)",
    "function registerFirstProcess(string lotNos, string operatorId, string machineId, string processingHouseId, string timestamp)",
    "function registerSecondProcess(string firstProcessLotIds, string machineId, string operatorId, string secondProcessOutputLotId)",
    "function packing(string secondProcessLotId, string operatorId, string packageId, string weight, string packagingType)",
    "function transport(string packageId, string operatorId, string transporterId, string cartonId)",
    // Other function and event signatures as needed
];

const contractAddress = '0xFa4e63b668cf42b23fD12db3F0ad1Ed16C351F46';
const coffeeContract = new ethers.Contract(contractAddress, contractABI, signer);

// Functions for Each Stage
async function createLot() {
    const tx = await coffeeContract.createLot('Arabica', '1000kg', 'Farmer Joe', 'Brazilian Farm', 'Lot001', 'TransCo');
    console.log('Lot Created: ', await tx.wait());
}

async function processBeansFirstStage() {
    const tx = await coffeeContract.registerFirstProcess('Lot001', 'Processor Amy', 'Machine 5', 'Washing Station A', '2024-01-15');
    //HASURA THIS process name 'first process' => index lot001 + time stamp + txn hash 
    console.log('Beans First Stage Processed: ', await tx.wait());
}

async function processBeansSecondStage() {
    const secondProcessOutputLotId = 'SecondProcess001';
    const tx = await coffeeContract.registerSecondProcess('Lot001', 'Machine 8', 'Processor Bob', secondProcessOutputLotId);
    //HASURA THIS process name 'second process' => index lot001 + time stamp  + txn hash 
    console.log('Beans Second Stage Processed: ', await tx.wait());
    return secondProcessOutputLotId;
}

async function packageCoffee(secondProcessOutputLotId) {
    //HASURA THIS process name 'packing' => index secondProcessOutputLotId + time stamp  + txn hash 
    const tx = await coffeeContract.packing(secondProcessOutputLotId, 'Packer Carla', 'Pack001', '950kg', 'Vacuum Sealed');
    console.log('Coffee Packaged: ', await tx.wait());
}

async function transportCoffee() {
    ///HASURA THIS /process name 'transport' => Pack001 + time stamp  + txn hash 
    const tx = await coffeeContract.transport('Pack001', 'Transporter Dave', 'TransCo', 'Carton001');
    console.log('Coffee Transported: ', await tx.wait());
}

// Running the Demo
async function runDemo() {
    console.log('Starting Coffee Bean Journey...');
    await createLot();
    await processBeansFirstStage();
    const secondProcessOutputLotId = await processBeansSecondStage();
    await packageCoffee(secondProcessOutputLotId);
    await transportCoffee();
    console.log('Coffee Bean Journey Complete!');
}

runDemo();
