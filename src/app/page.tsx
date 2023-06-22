"use client"
import {useState, useContext, useCallback, useMemo, useEffect} from "react";
import styles from './page.module.css'
import {AppContext, AppContextProvider} from "@/components/context-provider/app-context-provider";
// import classes from "./classes.scss";
import {getBoards} from "@/hooks/useBoards";
import mondaySdk from "monday-sdk-js";
import {Dropdown} from "monday-ui-react-core";
import {getActivities, getFeatureRequestAccounts} from "@/hooks/activities";
const monday = mondaySdk();

export default function Home() {

    let accountsBoardId = 0
    const  [activitiesBoardId, setActivitiesBoardId] = useState(0);

    // let accounts: any = []

    let account: any = {}
    const  [selectedAccount, setSelectedAccount] = useState({label: "", value: 0});
    const  [videoExists, setVideoExists] = useState(false);

    const  [accounts, setAccounts] = useState([]);

    function mapWorkspacesToDropdownOptions(
        accounts: any[] | undefined
    ) {

        const result = accounts?.reduce(function reduceToTextColumns(
                filtered: Record<string, any>[],
                workspace: Record<string, any>
            ) {
                filtered.push({
                    label: workspace.name,
                    value: workspace.id,
                });
                return filtered;
            },
            []);
        return result ?? [];
    }


    useEffect(() => {
        monday.get("context").then((res) => {
            account = res.data.account
        })
        getBoards().then((res) => {
            if (res.is_success) {

                res.data.boards.forEach((b: any, i: any) => {
                    if (b.name === "Accounts") {
                        accountsBoardId = parseInt(b.id)

                        setAccounts(b.items.flatMap((x: any) => {return {name: x.name, id: x.id}}))
                    } else if(b.name === "Activities") {
                        setActivitiesBoardId(parseInt(b.id))
                    }
                })
            }

        })
    },[])

    async function onAccountSelect(e: any){
        setSelectedAccount(e)

        fetch(`/${e.label.toLowerCase().replaceAll(" ", "-")}.mp4`).then((res) =>{
            if(res.status == 200) {
                setVideoExists(true)
            } else {
                setVideoExists(false)
            }
        })
    }

    async function generateStory() {
        console.log(activitiesBoardId)

        let activities = await getActivities(activitiesBoardId).then((res: any) => {
            console.log(res)
            if(res.is_success) {
                return res.data.boards[0]
            }
        })

        activities = activities.items.filter((x: any) => {
            if(x.column_values[2].value) {
                if(JSON.parse(x.column_values[2].value).linkedPulseIds[0].linkedPulseId == selectedAccount.value) {
                    return x
                }
            }
        })

        const customerName = activities[0].column_values[2].text

        const transcripts = activities.flatMap((x: any) => {
            return x.column_values[7].value
        })

        const story: any = await fetch("/api/story", {
            method: "POST",
            body: JSON.stringify({
                customer: customerName,
                transcripts
            }),
        }).then(async (res) => await res.json())

        console.log(story)
    }


    const renderApp = useMemo(() => {
        return <div>
            {videoExists ? <video width="250" height="250" controls >
                <source src={selectedAccount.label.toLowerCase().replaceAll(" ", "-") + ".mp4"} type="video/mp4"/>
            </video> :  null }
            <br/>
            <label>Account Story</label>

            <Dropdown
                // className={classes.columnsDropdown}
                options={mapWorkspacesToDropdownOptions(accounts)}
                onChange={onAccountSelect}
                value={mapWorkspacesToDropdownOptions(accounts).filter((account: any) => account.value === selectedAccount.value)}
                size="small"
            />

            <button onClick={generateStory}>Generate Story</button>
        </div>
    }, [accounts, selectedAccount, videoExists])

    return (
      <div className={styles.App}>
        <AppContextProvider>
            {renderApp}
        </AppContextProvider>
      </div>
  )
}


