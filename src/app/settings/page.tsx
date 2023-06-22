"use client"
import {useState, useMemo, useContext, useEffect} from "react";
import styles from '../page.module.css'
import { AppContext, AppContextProvider } from '@/components/context-provider/app-context-provider';
import useWorkspaces, { mapWorkspacesToDropdownOptions } from "@/hooks/useWorkspaces";
import SelectColumn from "@/components/select-column";
import classes from "../../examples/basic-prompt-layout/prompt-layout.module.scss";
import { setSettings, getSettings } from "@/hooks/useSettings";
import { PrismaClient } from "@prisma/client";
import useAccount from "@/hooks/useAccount";
import SelectWorkspace from "@/components/select-workspace";


export const dynamic = 'force-static'

type DropdownSelection = {
  label: string;
  value: number;
};

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

async function setAccountSettings(id: number, crm_workspace_id: number, pm_workspace_id: number) {
  if(!id) {
    return {}
  }
  const response = await fetch("/api/account/settings", {
    method: "POST",
    body: JSON.stringify({
      account_id: id,
      crm_workspace_id: crm_workspace_id,
      pm_workspace_id: pm_workspace_id,
    })
  });
  return response.json();
};



export default function Settings() {
  const context = useContext(AppContext);

  const  [displayedApp, setAppToDisplay] = useState('');
  const [settings, setSettings] = useState({account_id: 0, pm_workspace_id: -1, crm_workspace_id: -1});

  const account = useAccount(context);


  useEffect(() => {
    if(account) {
      getAccountSettings(account.id).then((res) => {
        setSettings(res)
      })

    }

  },[account])



  const workspaces = useWorkspaces(context);
  const workspacesForDropdown = useMemo(() => {
    return mapWorkspacesToDropdownOptions(workspaces) ?? [];
  }, [workspaces]);


  const [selectedCRMWorkspace, setSelectedCRMWorkspace] = useState<string>();
  function handleCRMWorkspaceSelect(e: DropdownSelection) {
    if(account) {
      setAccountSettings(account.id, e.value, settings.pm_workspace_id)
    }
  }

  const [selectPMWorkspace, setSelectedPMWorkspace] = useState<string>();
  function handlePMWorkspaceSelect(e: DropdownSelection) {
    console.log(e)
    if(account) {
      setAccountSettings(account.id, settings.crm_workspace_id, e.value ?? 0)
    }
  }

  // const boardGroupsForDropdown = useMemo(() => {
  //   return mapBoardGroupsToDropdownOptions(boardGroups) ?? [];
  // }, [boardGroups]);
  const renderApp = useMemo(() => {

    
    return <div>
      <div className={classes.dropdownContainer}>
        <label>CRM Workspace</label>
        <SelectWorkspace
          className={classes.columnsDropdown}
          workspaces={workspacesForDropdown}
          onChange={handleCRMWorkspaceSelect}
          value={workspacesForDropdown.filter((workspace) => workspace.value === settings.crm_workspace_id)[0]}
        />
        <label>Project Management Workspace</label>
        <SelectWorkspace
          className={classes.columnsDropdown}
          workspaces={workspacesForDropdown}
          onChange={handlePMWorkspaceSelect}
          value={workspacesForDropdown.filter((workspace) => workspace.value === settings.pm_workspace_id)[0]}
        />
      </div>

    </div>
  }, [displayedApp, workspaces, settings]);

  return (
      <div className={styles.App}>
          {renderApp}
      </div>
  )
}


