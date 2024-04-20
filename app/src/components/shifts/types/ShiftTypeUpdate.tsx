import {
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  EditCalendar as EditCalendarIcon,
} from "@mui/icons-material";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { ErrorPage } from "src/components/general/ErrorPage";
import { Loading } from "src/components/general/Loading";
import { SnackbarText } from "src/components/general/SnackbarText";
import { Hero } from "src/components/layout/Hero";
import {
  defaultValues,
  IFormValues,
  ShiftTypeForm,
} from "src/components/shifts/types/ShiftTypeForm";
import type { IResShiftTypePositionItem } from "src/components/types";
import { fetcherGet, fetcherTrigger } from "src/utils/fetcher";

export const ShiftTypeUpdate = () => {
  // state
  // --------------------
  const [isMounted, setIsMounted] = useState(false);

  // fetching, mutation, and revalidation
  // --------------------
  const router = useRouter();
  const { shiftTypeId } = router.query;
  const { data: dataDefaults, error: errorDefaults } = useSWR(
    "/api/shifts/types/defaults"
  );
  const { data: dataCurrent, error: errorCurrent } = useSWR(
    isMounted ? `/api/shifts/types/${shiftTypeId}` : null,
    fetcherGet
  );
  const { isMutating, trigger } = useSWRMutation(
    `/api/shifts/types/${shiftTypeId}`,
    fetcherTrigger
  );

  // other hooks
  // --------------------
  const {
    clearErrors,
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setError,
    setValue,
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });
  const {
    append: timeAppend,
    fields: timeFields,
    remove: timeRemove,
  } = useFieldArray({
    control,
    name: "timeList",
  });
  const {
    append: positionAppend,
    fields: positionFields,
    remove: positionRemove,
  } = useFieldArray({
    control,
    name: "positionList",
  });
  const { enqueueSnackbar } = useSnackbar();
  dayjs.extend(isSameOrBefore);

  // side effects
  // --------------------
  useEffect(() => {
    if (router.isReady) {
      setIsMounted(true);
    }
  }, [router.isReady]);
  useEffect(() => {
    if (dataCurrent) {
      const { shiftTypeInformation, shiftTypePositionList, shiftTypeTimeList } =
        dataCurrent;

      reset({
        information: shiftTypeInformation,
        positionList: shiftTypePositionList,
        timeList: shiftTypeTimeList,
      });
    }
  }, [dataCurrent, reset]);

  // logic
  // --------------------
  if (errorDefaults || errorCurrent) return <ErrorPage />;
  if (!dataDefaults || !dataCurrent) return <Loading />;

  // form submission
  // --------------------
  const onSubmit: SubmitHandler<IFormValues> = async (formValues) => {
    try {
      const { shiftCategoryId } = dataDefaults.shiftCategoryList.find(
        ({ shiftCategoryName }: { shiftCategoryName: string }) => {
          return shiftCategoryName === formValues.information.category;
        }
      );
      const positionList = formValues.positionList.map(
        ({ name, totalSlots, wapPoints }) => {
          const { positionId } = dataDefaults.positionList.find(
            (positionItem: IResShiftTypePositionItem) => {
              return positionItem.name === name;
            }
          );

          return {
            positionId,
            totalSlots,
            wapPoints,
          };
        }
      );
      const timeList = formValues.timeList.map(
        ({ date, endTime, instance, notes, shiftTimesId, startTime }) => {
          const dateFormat = dayjs(date).format("YYYY-MM-DD");

          return {
            date: dateFormat,
            endTime: `${dateFormat} ${dayjs(endTime).format("HH:mm:ss")}`,
            instance,
            notes,
            shiftTimesId,
            startTime: `${dateFormat} ${dayjs(startTime).format("HH:mm:ss")}`,
          };
        }
      );

      // update database
      await trigger({
        body: {
          information: {
            details: formValues.information.details,
            isCore: formValues.information.isCore,
            isOffPlaya: formValues.information.isOffPlaya,
            name: formValues.information.name,
            shiftCategoryId,
          },
          positionList,
          timeList,
        },
        method: "PATCH",
      });

      enqueueSnackbar(
        <SnackbarText>
          <strong>
            <strong>{formValues.information.name}</strong>
          </strong>{" "}
          shift type has been updated
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

  // display
  // --------------------
  return (
    <>
      <Hero
        Image={
          <Image
            alt="volunteers riding the census art car"
            fill
            priority
            src="/volunteers/account/create/hero.jpg"
            style={{
              objectFit: "cover",
            }}
          />
        }
        text="Update shift type"
      />
      <Container component="main">
        <Box component="section">
          <Breadcrumbs>
            <Link href="/shifts/types">
              <Typography
                sx={{
                  alignItems: "center",
                  display: "flex",
                  textDecoration: "underline",
                }}
              >
                <DateRangeIcon sx={{ mr: 0.5 }} />
                Shift types
              </Typography>
            </Link>
            <Typography
              sx={{
                alignItems: "center",
                display: "flex",
              }}
            >
              <EditCalendarIcon sx={{ mr: 0.5 }} />
              Update type
            </Typography>
          </Breadcrumbs>
        </Box>
        <Box component="section">
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <ShiftTypeForm
              clearErrors={clearErrors}
              control={control}
              data={dataDefaults}
              errors={errors}
              getValues={getValues}
              positionAppend={positionAppend}
              positionFields={positionFields}
              positionRemove={positionRemove}
              setError={setError}
              setValue={setValue}
              timeAppend={timeAppend}
              timeFields={timeFields}
              timeRemove={timeRemove}
            />

            {/* actions */}
            <Card>
              <CardActions
                sx={{
                  justifyContent: "flex-end",
                  p: 2,
                }}
              >
                <Button
                  disabled={isMutating}
                  startIcon={
                    isMutating ? (
                      <CircularProgress size="1rem" />
                    ) : (
                      <CloseIcon />
                    )
                  }
                  onClick={() => {
                    reset(defaultValues);
                    router.push("/shifts/types");
                  }}
                  type="button"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  disabled={Object.keys(errors).length > 0 || isMutating}
                  startIcon={
                    isMutating ? (
                      <CircularProgress size="1rem" />
                    ) : (
                      <EditCalendarIcon />
                    )
                  }
                  type="submit"
                  variant="contained"
                >
                  Update type
                </Button>
              </CardActions>
            </Card>
          </form>
        </Box>
      </Container>
    </>
  );
};
