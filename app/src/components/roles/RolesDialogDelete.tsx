import {
  Delete as DeleteIcon,
  HighlightOff as HighlightOffIcon,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import io from "socket.io-client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { DialogHeader } from "src/components/general/DialogHeader";
import { ErrorAlert } from "src/components/general/ErrorAlert";
import { Loading } from "src/components/general/Loading";
import { SnackbarText } from "src/components/general/SnackbarText";
import { IDataRoleVolunteerItem } from "src/components/types";
import { fetcherGet, fetcherTrigger } from "src/utils/fetcher";

interface IRolesDialogDeleteProps {
  handleDialogDeleteClose: () => void;
  isDialogDeleteOpen: boolean;
  role: {
    name: string;
  };
}

const socket = io();
export const RolesDialogDelete = ({
  handleDialogDeleteClose,
  isDialogDeleteOpen,
  role: { name },
}: IRolesDialogDeleteProps) => {
  const { data, error } = useSWR(`/api/roles/${encodeURI(name)}`, fetcherGet);
  const { isMutating, trigger } = useSWRMutation("/api/roles", fetcherTrigger);
  const { enqueueSnackbar } = useSnackbar();

  // handle role delete
  const handleRoleDelete = async () => {
    try {
      await trigger({
        body: {
          name,
        },
        method: "DELETE",
      });
      socket.emit("req-role-delete", {
        name,
      });

      handleDialogDeleteClose();
      enqueueSnackbar(
        <SnackbarText>
          <strong>{name}</strong> role has been deleted
        </SnackbarText>,
        {
          variant: "success",
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(
          <SnackbarText>
            <strong>{error.message}</strong>
          </SnackbarText>,
          {
            persist: true,
            variant: "error",
          }
        );
      }

      throw error;
    }
  };

  if (error)
    return (
      <Dialog
        fullWidth
        onClose={handleDialogDeleteClose}
        open={isDialogDeleteOpen}
      >
        <DialogHeader
          handleDialogClose={handleDialogDeleteClose}
          text="Delete role"
        />
        <DialogContent>
          <ErrorAlert />
        </DialogContent>
      </Dialog>
    );
  if (!data)
    return (
      <Dialog
        fullWidth
        onClose={handleDialogDeleteClose}
        open={isDialogDeleteOpen}
      >
        <DialogHeader
          handleDialogClose={handleDialogDeleteClose}
          text="Delete role"
        />
        <DialogContent>
          <Loading />
        </DialogContent>
      </Dialog>
    );

  return (
    <Dialog
      fullWidth
      onClose={handleDialogDeleteClose}
      open={isDialogDeleteOpen}
    >
      <DialogHeader
        handleDialogClose={handleDialogDeleteClose}
        text="Delete role"
      />
      <DialogContent>
        {data.dataRoleVolunteerList && data.dataRoleVolunteerList.length > 0 ? (
          <>
            <DialogContentText>
              <Typography component="span">
                Before doing so, the <strong>{name}</strong> role must be
                removed from the following volunteers:
              </Typography>
            </DialogContentText>
            <List sx={{ pl: 2, listStyleType: "disc" }}>
              {data.dataRoleVolunteerList.map(
                ({
                  playaName,
                  shiftboardId,
                  worldName,
                }: IDataRoleVolunteerItem) => {
                  return (
                    <ListItem
                      disablePadding
                      key={shiftboardId}
                      sx={{ display: "list-item", pl: 0 }}
                    >
                      <ListItemText primary={`${playaName} "${worldName}"`} />
                    </ListItem>
                  );
                }
              )}
            </List>
          </>
        ) : (
          <DialogContentText>
            <Typography component="span">
              Are you sure you want to delete <strong>{name}</strong> role?
            </Typography>
          </DialogContentText>
        )}
        <DialogActions>
          <Button
            disabled={isMutating}
            startIcon={<HighlightOffIcon />}
            onClick={handleDialogDeleteClose}
            type="button"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            disabled={
              (data.dataRoleVolunteerList &&
                data.dataRoleVolunteerList.length > 0) ||
              isMutating
            }
            onClick={handleRoleDelete}
            startIcon={
              isMutating ? <CircularProgress size="1rem" /> : <DeleteIcon />
            }
            type="submit"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
