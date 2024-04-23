import React, { useState, useEffect, Children} from "react";
import Wenb3Modal from "web3modal";
import { ethers } from "ethers";

// INTERNAL • IMPORT
import { CrowdFundingABI, CrowdFundingAddress } from "./contants" ;

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider);

export const CrowdFundingContext = React.createContext();

export const CrowdFundingProvider = ({children}) => {
    const titleData = "Crowd Funding Contract";
    const [currentAccount, setCurrentAccount] = useState("");

    const createCampaign = async (campaign) => {
        const {title, description, amount, deadline} = campaign;
        const web3Modal = new Wenb3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);

        console.log(currentAccount);
        try{
            const transaction = await contract.createCampaign(
                currentAccount,
                title,
                description,
                ethers.utils.parseUnits(amount, 18),
                new Date(deadline).getTime()
            );
            await transaction.wait();

            console.log("contract call success", transaction);
        }catch(error){
            console.log("contract call failure", error);
        }
    };

    const getCampaigns = async() => {
        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);
        const campaigns = await contract.getCampaigns();
        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(), // Convert Unix timestamp to JavaScript Date
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
            pId: i
        }));
        return parsedCampaigns;
    };

    const getUserCampaigns = async () => {
        const provider = new ethers.providers.JsonRpcProvider(); // Initialize JSON RPC provider
        const contract = fetchContract(provider); // Fetch contract instance
    
        // Fetch all campaigns
        const allCampaigns = await contract.getCampaigns();
    
        // Fetch current user's accounts
        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });
        const currentUser = accounts[0];
    
        // Filter campaigns owned by the current user
        const filteredCampaigns = allCampaigns.filter
        (campaign => 
            campaign.owner === "0xf39fd6e51aad88f6f4ce6ab8827279cfff692266"
        );
    
        // Format and map the filtered campaigns
        const userData = filteredCampaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
            pId: i,
        })); 
        return userData;   
    };

    const donate = async (pid, amount) => {
        const web3Modal = new Wenb3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
    
        const campaignData = await contract.donateToCampaign(pid, {
            value: ethers.utils.parseEther(amount),
        });
    
        await campaignData.wait();
        location.reload();
        
        return campaignData;
    };

    const getDonations = async (pId) => {
        const provider = new ethers.providers.JsonRpcProvider(); // Initialize JSON RPC provider
        const contract = fetchContract(provider); // Fetch contract instance
        
        // Fetch donations for the given campaign ID
        const donations = await contract.getDonators(pId);
        const numberOfDonations = donations[0].length;
        
        // Parse donations
        const parsedDonations = [];
        for (let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            });
        }
    
        return parsedDonations;
    };

    const checkIfWalletConnected = async () => {
        try {
            if (!window.ethereum) {
                return setOpenError(true), setError("Install MetaMask");
                
                
            }
    
            const accounts = await window.ethereum.request({
                method: "eth_accounts"
            });
    
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No Account Found");
            }
        } catch (error) {
            console.log("Something wrong while connecting to wallet");
        }
    };

    useEffect(() => {
        checkIfWalletConnected();
    }, []);

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                return console.log("Install MetaMask");
                
            }
    
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
    
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log("Error while connecting to wallet", error);
        }
    };
    
    return (
        <CrowdFundingContext.Provider
            value={{
                titleData,
                currentAccount,
                createCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations,
                connectWallet
            }}
        >
            {children}
        </CrowdFundingContext.Provider>
    );
};    