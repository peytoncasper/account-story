"use client"
import {useCallback, useState, useMemo} from "react";
import Image from 'next/image'
import styles from './page.module.css'
import { AppContextProvider } from '@/components/context-provider/app-context-provider';
import BasePromptLayout from '@/examples/basic-prompt-layout/prompt-layout';
import PromptWithColumnMapping from '@/examples/prompt-with-column-mapping/prompt-with-column-mapping';
import LivestreamExampleFinal from '@/examples/livestream-example/final-code';
import LivestreamExample from '@/examples/livestream-example/boilerplate';
import AiAppFooter from '@/components/ai-footer/ai-footer';
import ContextExplorerExample from '@/examples/context-explorer/context-explorer-example'
import { Button } from "monday-ui-react-core";

export default function Home() {
  const  [displayedApp, setAppToDisplay] = useState('');

  const renderApp = useMemo(() => {
    return <div>
      Hello World
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


