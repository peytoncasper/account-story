"use client"
import {useState, useMemo, useContext, useEffect} from "react";
import styles from '../../page.module.css'
import { AppContext, AppContextProvider } from '@/components/context-provider/app-context-provider';
import classes from "../../examples/basic-prompt-layout/prompt-layout.module.scss";
import { setSettings, getSettings } from "@/hooks/useSettings";
import useAccount from "@/hooks/useAccount";
import React from "react";

export const dynamic = 'force-dynamic'

export default function TranscribeCall() {
  const context = useContext(AppContext);

  const  [displayedApp, setAppToDisplay] = useState('');

  const account = useAccount(context);

    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  
    const handleClick = () => {
      if(hiddenFileInput && hiddenFileInput.current) {
        hiddenFileInput.current.click();
      }
    };
    
    const handleChange = (event: any) => {
      const fileUploaded = event.target.files[0];
      var data = new FormData()
      data.append('file', fileUploaded)

      const response = fetch("/api/activity/transcribe", {
        method: "POST",
        body: data,
      }).then((res) => {
        console.log(res);
      })
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
  }, [displayedApp]);

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


