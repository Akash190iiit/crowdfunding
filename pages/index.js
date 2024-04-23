import React, { useContext, useState, useEffect } from "react";
import { CrowdFundingContext } from "../Context/CrowdFunding"; // Assuming the correct path to CrowdFundingContext
import { Hero, Card, PopUp } from "../Components"; // Assuming the correct path to Components
// import PopUp from "../Components/PopUp";

const index = () => {
    const {
        titleData,
        getCampaigns,
        createCampaign,
        donate,
        getUserCampaigns,
        getDonations,
    } = useContext(CrowdFundingContext);

    const [allCampaigns, setAllCampaigns] = useState();
    const [userCampaigns, setUserCampaigns] = useState();

    useEffect(() => {
        const getCampaignsData = getCampaigns();
        const userCampaignsData = getUserCampaigns();
        return async () => {
            const allData = await getCampaignsData;
            const userData = await userCampaignsData;
            setAllCampaigns(allData);
            setUserCampaigns(userData);
        };
        }, []);

        const [openModel, setOpenModel] = useState(false);
        const [donateCampaign, setDonateCampaign] = useState();

        console.log(donateCampaign);
        return(
            <>
             <Hero titleData={titleData} createCampaign={createCampaign}/>
             <Card
                title = "All listed Campaign"
                allcampaign = {allCampaigns}
                setOpenModel={setOpenModel}
                setDonate={setDonateCampaign}
            />  
            <Card
                title = "Your Created Campaign"
                allcampaign = {userCampaigns}
                setOpenModel={setOpenModel}
                setDonate={setDonateCampaign}
            />    

            {openModel && (
                <PopUp
                    setOpenModel = {setOpenModel}
                    getDonations={getDonations}
                    donate={donateCampaign}
                    donateFunction={donate}
                />
            )}
            </>
        );
    }; 
    
    export default index;