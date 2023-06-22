"use client"
import {useState, useMemo, useContext, useEffect} from "react";
import styles from '../../page.module.css'
import { AppContext, AppContextProvider } from '@/components/context-provider/app-context-provider';
import classes from "../../examples/basic-prompt-layout/prompt-layout.module.scss";
import { setSettings, getSettings } from "@/hooks/useSettings";
import useAccount from "@/hooks/useAccount";
import React from "react";
import useBoardGroups, {getBoardGroups} from "@/hooks/useBoardGroups";
import useBoards, {getBoards} from "@/hooks/useBoards";
import {
    createActivity,
    getActivities,
    updateConnectBoard,
    updateFeatureRequestAccount,
    updatePeople
} from "@/hooks/activities";
import {getBoardViews} from "@/hooks/boardViews";
import {getItem} from "@/hooks/items";
import useBoardColumns from "@/hooks/useBoardColumns";
import mondaySdk from 'monday-sdk-js';
import {getAccountByName, getFeatureRequestByName, getMe, me} from "@/hooks/accounts";
import column from "monday-ui-react-core/src/components/Icon/Icons/components/Column";
import item from "monday-ui-react-core/src/components/Icon/Icons/components/Item";

const monday = mondaySdk();

export const dynamic = 'force-dynamic'

async function getAccountSettings(id: number) {
    if(!id) {
        return {}
    }
    const response = await fetch("/api/account/settings?" + new URLSearchParams({
        accountId: id.toString(),
    }), {
        method: "GET",
    });
    return response.json();
};


export default function TranscribeCall() {
    const context = useContext(AppContext);

    const  [displayedApp, setAppToDisplay] = useState('');
    const [settings, setSettings] = useState({account_id: 0, pm_workspace_id: -1, crm_workspace_id: -1});
    let account = {id: 0, name: ""}
    // const boards = useBoards(context);

    // const [accountsBoardId, setAccountsBoardId] = useState(0)
    let activitiesBoardId = 0
    let accountsBoardId = 0
    let pmBoardId = 0

    let accounts: any[] = []

    let me: any = {}


    useEffect(() => {
        monday.get("context").then((res) => {
            account = res.data.account


            getAccountSettings(res.data.account.id).then((res) => {
                setSettings(res)
            })
        })

        getMe().then((res) => {
            if(res.is_success) {
                me = res.data.me
            }
        })

        getBoards().then((res) => {
            if (res.is_success) {
                console.log(res.data.boards)

                res.data.boards.forEach((b: any, i: any) => {
                    if (b.name === "Accounts") {
                        accountsBoardId = parseInt(b.id)

                        accounts = b.items.flatMap((x) => {return x.name})
                    } else if(b.name === "Activities") {
                        activitiesBoardId = parseInt(b.id)
                    } else if (b.name === "Project Management") {
                        pmBoardId = parseInt(b.id)
                    }
                })
            }

        })


    },[])
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  
    const handleClick = () => {
      if(hiddenFileInput && hiddenFileInput.current) {
        hiddenFileInput.current.click();
      }
    };
    
    const handleChange = async (event: any) => {
      const fileUploaded = event.target.files[0];
      var data = new FormData()
      data.append('file', fileUploaded)

      const response = await fetch("/api/activity/transcribe", {
        method: "POST",
        body: data,
      }).then(async (res) => await res.json())

      const transcription = await fetch(response.url).then(async (res) => await res.json())


        const trimmedTranscript = transcription.segments.flatMap((seg: any) => {
            return seg.speaker + ": " + seg.transcript.flatMap((transcriptPiece: any) => {
                return transcriptPiece.text + " "
            }) + "\n\n"
        })


        const metadata: any = await fetch("/api/activity/metadata", {
          method: "POST",
          body: JSON.stringify({
              transcription,
              accounts: accounts,
          }),
        }).then(async (res) => await res.json())

        console.log(metadata)

        const customer = await getAccountByName(accountsBoardId, metadata.customer_account).then((res) => {
            if (res.is_success) {
                return res.data.items_by_column_values[0]
            }
        })

        const m = new Date();
        var dateString =
            m.getUTCFullYear() + "-" +
            ("0" + (m.getUTCMonth()+1)).slice(-2) + "-" +
            ("0" + m.getUTCDate()).slice(-2) + " " +
            ("0" + m.getUTCHours()).slice(-2) + ":" +
            ("0" + m.getUTCMinutes()).slice(-2) + ":" +
            ("0" + m.getUTCSeconds()).slice(-2);
        const length = transcription.segments[transcription.segments.length - 1].stop.split(":")

        const endDate = new Date(m)
        endDate.setHours(endDate.getHours() + parseInt(length[0]))
        endDate.setMinutes(endDate.getMinutes() + parseInt(length[1]))
        endDate.setSeconds(endDate.getSeconds() + parseInt(length[2]))


        var endDateString =
            m.getUTCFullYear() + "-" +
            ("0" + (m.getUTCMonth()+1)).slice(-2) + "-" +
            ("0" + m.getUTCDate()).slice(-2) + " " +
            ("0" + (m.getUTCHours())).slice(-2) + ":" +
            ("0" + (m.getUTCMinutes())).slice(-2) + ":" +
            ("0" + (m.getUTCSeconds())).slice(-2);

        const column_values = {
            "activity_start_time": dateString,
            "activity_end_time": endDateString,
            "activity_status": "Done",
            "activity_type": "Call summary",
            "text1": trimmedTranscript[0]
        }


        const itemId = await createActivity(activitiesBoardId, customer.name + " - " + "Call Summary", column_values).then((res) => {
            if(res.is_success) {
                return res.data.create_item.id
            }
        })

        updatePeople(activitiesBoardId, parseInt(itemId), me.email).then((res) => {
        })

        updateConnectBoard(activitiesBoardId, parseInt(itemId), parseInt(customer.id)).then((res) => {
        })

        if (metadata.feature_requests.length > 0) {
            const frs = await fetch("/api/features/search", {
                method: "POST",
                body: JSON.stringify({
                    query: `${metadata.feature_requests[0].feature}   ${metadata.feature_requests[0].purpose}`
                }),
            }).then(async (res) => await res.json())

            if(frs.matches[0].score > .9) {
                const row = await getFeatureRequestByName(pmBoardId, frs.matches[0].id).then((res) => {
                    console.log(res)
                    if(res.is_success) {
                        return res.data.items_by_column_values[0]
                    }
                })

                const existingAccounts = JSON.parse(row.column_values[4].value).linkedPulseIds.flatMap((x: any) => {
                    return parseInt(x.linkedPulseId)
                })
                existingAccounts.push(parseInt(customer.id))

                updateFeatureRequestAccount(pmBoardId, parseInt(row.id), existingAccounts).then((res) => {
                    console.log(res)
                })
            }
        }

        await fetch("/api/transcription", {
            method: "POST",
            body: JSON.stringify({
                id: itemId,
                transcript: trimmedTranscript[0]
            }),
        }).then(async (res) => await res.json())

    };

  const renderApp = useMemo(() => {

    
    return <div>
      <div>
        <label></label>
        <button onClick={handleClick}>
            Select a Video or Audio Recording
        </button>
        <input
            type="file"
            ref={hiddenFileInput}
            onChange={handleChange}
            style={{display: 'none'}}
        />
      </div>

    </div>
  }, []);

  return (
      <div className={styles.App}>
        <AppContextProvider>
          <>
            {renderApp}
          </>
        </AppContextProvider>
      </div>
  )
}


