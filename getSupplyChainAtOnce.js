
import fetch from 'node-fetch'
const graphqlEndpoint = 'https://supply-chain-gmw-e6ba.gke-europe.settlemint.com/subgraphs/name/supply-chain-scs-c3dc';
const lotId = "10"; // Replace with your specific lot ID

async function fetchGraphQL(query, variables = {}) {
    const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': 'sm_pat_518100010642a707'
        },
        body: JSON.stringify({ query, variables }),
    });
    const responseBody = await response.json();
    return responseBody.data;
}

async function main() {
    const supplyChain = [];
    try {
        // Combined Query
        const combinedQuery = `
                query GetFullTrackOfLot($lotId: ID!) {
                    lot(id: ${lotId}) {
                        id
                        lotType
                        quantity
                        operatorId
                        originId
                        transporterId
                        lotNo
                    }
                    firstProcesses(where: {lotNos: $lotId}) {
                        firstProcessLotId
                        lotNos
                        operatorId
                        machineId
                        processingHouseId
                    }
                    secondProcesses(where: {firstProcessLotIds: $lotId}) {
                        secondProcessLotId
                        firstProcessLotIds
                        machineId
                        operatorId
                    }
                    packings(where: {id: $lotId}) {
                        id
                        operatorId
                        packageId
                        packagingType
                        packingLotId
                        secondProcessLotId
                    }
                    transports(where: {transportLotId: $lotId}) {
                        cartonId
                        id
                        operatorId
                        packageId
                        transportLotId
                        transporterId
                    }
                }`;
        const supplyChainData = await fetchGraphQL(combinedQuery, { lotId });
        console.log(supplyChainData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}





main(lotId)
