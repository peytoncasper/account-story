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

export function getAccountByName(boardId: number, name: string) {
    return executeMondayApiCall(
        `query($boardId: Int!, $name: String!) {
            items_by_column_values (board_id: $boardId, column_id: "name", column_value: $name) {
                id
                name
            }
        }`,
        {variables: {boardId: boardId, name: name}}
    )
}


export function getMe() {
    return executeMondayApiCall(
        `query {
          me {
            is_guest
            created_at
            name
            id
            email
            
            }
        }`,
        {variables: {}}
    )
}

export function getFeatureRequestByName(boardId: number, name: string) {
    return executeMondayApiCall(
        `query($boardId: Int!, $name: String!) {
            items_by_column_values (board_id: $boardId, column_id: "name", column_value: $name) {
                id
                name
                column_values {
                    id
                    value
                    text
                    title
                }
            }
        }`,
        {variables: {boardId: boardId, name: name}}
    )
}