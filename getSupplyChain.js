
import fetch from 'node-fetch'
const graphqlEndpoint = 'https://supply-chain-gmw-e6ba.gke-europe.settlemint.com/subgraphs/name/supply-chain-scs-c3dc';
const lotId = '9'; // Replace with your specific lot ID

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
        // Initial Query
        const initialQuery = `
        query GetFullTrackOfLot($lotId: ID!) {
            lot(id: $lotId) {
              id
              lotType
              quantity
              operatorId
              originId
              transporterId
            }
            firstProcesses(where: {lotNos: $lotId}) {
              firstProcessLotId
              lotNos
              operatorId
              machineId
              processingHouseId
            }

          }`;

        const getFirstProcess = await fetchGraphQL(initialQuery, { lotId });
        // console.log('first Process', getFirstProcess.firstProcesses[0].lotNos);

        supplyChain.push(getFirstProcess.firstProcesses[0])
        // Query for Packings
        const secondProcessQuery = `
        query GetFullTrackOfLot($lotId: ID!) {
            secondProcesses (where:{firstProcessLotIds:$lotId}){
              firstProcessLotIds
              id
              machineId
              operatorId
              secondProcessLotId
            }
          }`

        const getSecondProcess = await fetchGraphQL(secondProcessQuery, { lotId });
        // console.log('second proces', getSecondProcess.secondProcesses[0].id);

        supplyChain.push(getSecondProcess.secondProcesses[0])


        const packagesQuery = `
        query GetFullTrackOfLot($packingLotId: ID!) {
            packings(where: {packingLotId: $packingLotId}) {
                id
                operatorId
                packageId
                packagingType
                packingLotId
                secondProcessLotId
              }
        }`

        const secondPocessID = getSecondProcess.secondProcesses[0].id
        const packagesResult = await fetchGraphQL(packagesQuery, { packingLotId: secondPocessID });

        supplyChain.push(supplyChain.push(packagesResult.packings[0]))


        const packageId = await packagesResult.packings[0].packageId

        const transportQuery = `
        query GetFullTrackOfLot($packageId: ID!) {
            transports(where:{packageId:$packageId}) {
              cartonId
              id
              operatorId
              packageId
              transportLotId
              transporterId
            }
          }`

        const transportResults = await fetchGraphQL(transportQuery, { packageId });
        // console.log('transport', transportResults);
        supplyChain.push(supplyChain.push(transportResults.transports[0])
        )

        console.log(supplyChain);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

main();
