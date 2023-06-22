import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";

export default function useAccount(context: AppContextType | undefined) {
    const [account, setAccount] = useState<any>();
  
    // fill second dropdown with groups from board
    useEffect(() => {
      if (!account && context) {
        getAccount()
          .then((res: MondayApiResponse) => {
            if (!res.is_success) {
              showErrorMessage('Could not get account.', 3000);
            } else {
              const account = res?.data.users[0].account
              // console.log(res?.data)
              setAccount(account);
            }
            // const groupsForDropdown = mapBoardGroupsToDropdownOptions(res);
            // setBoardGroups(groupsForDropdown);
          })
          .catch((err: any) => console.error(err));
      }
    }, [context, account]);
  
    return account;
}

function getAccount() {
    return executeMondayApiCall(
        `query {
          users {
            account {
              id
              name
            }
          }
        }`,
        {variables: {}}
    )
}