import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";

export default function useBoards(context: AppContextType | undefined) {
    const [boards, setBoards] = useState<any>();
  
    // fill second dropdown with groups from board
    useEffect(() => {
      if (!boards && context) {
        const board = context?.iframeContext?.boardId ?? context?.iframeContext?.boardIds ?? [];
        getBoards()
          .then((res: MondayApiResponse) => {
            if (!res.is_success) {
              showErrorMessage('Could not get boards.', 3000);
            } else {
              const boards = res?.data.boards
              setBoards(boards);
            }
            // const groupsForDropdown = mapBoardGroupsToDropdownOptions(res);
            // setBoardGroups(groupsForDropdown);
          })
          .catch((err: any) => console.error(err));
      }
    }, [context, boards]);
  
    return boards;
}

export function getBoards() {
    return executeMondayApiCall(
        `query{
            boards{
                id
                name
                workspace_id
                items {
                    id
                    name    
                    column_values {
                        id
                        text
                        title
                        type
                    }
                }
            }
        }`,
        {variables: {}}
    )
}