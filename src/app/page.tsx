"use client"
import {useCallback, useState, useMemo, useContext} from "react";
import Image from 'next/image'
import styles from './page.module.css'
import { AppContext, AppContextProvider } from '@/components/context-provider/app-context-provider';
import BasePromptLayout from '@/examples/basic-prompt-layout/prompt-layout';
import PromptWithColumnMapping from '@/examples/prompt-with-column-mapping/prompt-with-column-mapping';
import LivestreamExampleFinal from '@/examples/livestream-example/final-code';
import LivestreamExample from '@/examples/livestream-example/boilerplate';
import AiAppFooter from '@/components/ai-footer/ai-footer';
import ContextExplorerExample from '@/examples/context-explorer/context-explorer-example'
import { Button } from "monday-ui-react-core";
import useBoards from "@/hooks/useBoards";
import useWorkspaces from "@/hooks/useWorkspaces";

export default function Home() {
  const context = useContext(AppContext);

  const  [displayedApp, setAppToDisplay] = useState('');
  
  const boards = useBoards(context);
  const workspaces = useWorkspaces(context);
  // const boardGroupsForDropdown = useMemo(() => {
  //   return mapBoardGroupsToDropdownOptions(boardGroups) ?? [];
  // }, [boardGroups]);
  const renderApp = useMemo(() => {
    return <div>
      {
        workspaces != null ? workspaces.map((board: any) => {
          return <div>{board.id}</div>
        }) : <div></div>
      }
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


