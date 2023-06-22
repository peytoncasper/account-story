"use client"
import {useState, useMemo, useContext, useEffect} from "react";
import styles from '../page.module.css'
import { AppContext, AppContextProvider } from '@/components/context-provider/app-context-provider';

import React from "react";
import mondaySdk from 'monday-sdk-js';
import {getItem} from "@/hooks/items";
import {sendNotification} from "@/hooks/activities";


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


export default function CustomerInterview() {
    const context = useContext(AppContext);

    const  [displayedApp, setAppToDisplay] = useState('');
    let account = {id: 0, name: ""}

    let activitiesBoardId = 0
    let accountsBoardId = 0
    let pmBoardId = 0
    let itemId = 0
    let accounts: any[] = []
    let me: any = {}


    useEffect(() => {
        monday.get("context").then((res) => {
            account = res.data.account
            itemId = res.data.pulseId
        })
    },[])

    async function handleClick() {
        const item = await getItem(itemId).then((res: any) => {
            if (res.is_success) {
                return res.data.items[0]
            }
        })

        const accountIds = JSON.parse(item.column_values[4].value).linkedPulseIds.flatMap((x: any) => {
            return x.linkedPulseId
        })

        for (const x of accountIds) {
            const account = await getItem(x).then((res: any) => {
                if(res.is_success) {
                    return res.data.items[0]
                }
            })

            const ownerId = JSON.parse(account.column_values[6].value).personsAndTeams[0].id

            await sendNotification(ownerId, itemId, "Project Management would like to schedule a customer interview with " + account.name)
        }

    }

  const renderApp = useMemo(() => {

    
    return <div>
        <button onClick={handleClick}>Schedule Customer Interviews</button>
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


