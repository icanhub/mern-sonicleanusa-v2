import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { Card, CardBody, CardHeader, Button, Row, Col } from "reactstrap";
import XLSX from "xlsx";
import PrivacyUploadModal from "../../components/PrivacyUploadModal/PrivacyUploadModal";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
  PaginationTotalStandalone,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import { ToastContainer } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import DealerActivateModal from "../../components/DealerActivateModal/DealerActivateModal";
import { isPending, hasSucceeded, isInitial } from "../../utils/state";

import {
  fetchDealersList,
  deleteDealerById,
  newDealerFileUpload,
  sendOnetimeActivationEmailApi,
} from "../../reducers/official";

import "./Dealers.scss";
import "react-toastify/dist/ReactToastify.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

const { SearchBar } = Search;

const sizePerPageRenderer = ({
  options,
  currSizePerPage,
  onSizePerPageChange,
}) => (
  <div className="btn-group" role="group">
    {options.map((option) => {
      const isSelect = currSizePerPage === `${option.page}`;
      return (
        <button
          key={option.text}
          type="button"
          onClick={() => onSizePerPageChange(option.page)}
          className={`btn ${isSelect ? "btn-secondary" : "btn-primary"}`}
        >
          {option.text}
        </button>
      );
    })}
  </div>
);

const Dealers = ({
  history,
  getDealersList,
  deleteDear,
  dealersList,
  sendOnetimeEmail,
  isVerified = true,
  state,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getDealersList({ isVerified: isVerified });
  }, []);

  useEffect(() => {
    dealersList.forEach((dealer) => {
      if (dealer.vacuumAccount) {
        dealer["mohawkAccount"] = dealer.vacuumAccount;
        dealer["mohawkBrand"] = dealer.roles;
      }
    });
  }, [dealersList]);

  const actionFormatter = (cell, row) => {
    return (
      <>
        {isVerified ? (
          <>
            <Button
              onClick={() => history.push(`/sales/${row._id}`)}
              color="primary"
              size="sm"
            >
              Order
            </Button>
            <Button
              onClick={() => history.push(`/profile/account/${row._id}`)}
              className="ml-1"
              color="success"
              size="sm"
            >
              Detail
            </Button>
          </>
        ) : (
          <DealerActivateModal data={row} />
        )}

        <ConfirmationModal
          text="Delete"
          size="sm"
          color="danger"
          header="Activation"
          onClickFunc={() => deleteDear(row._id, isVerified)}
        />
      </>
    );
  };

  const nameFormatter = (cell, row) => {
    return row.firstName + " " + row.lastName;
  };

  const columns = [
    {
      dataField: "firstName",
      text: "Name",
      formatter: nameFormatter,
      sort: true,
    },
    {
      dataField: "email",
      text: "Email",
      align: "right",
      headerAlign: "right",
      sort: true,
    },
    {
      dataField: "companyName",
      text: "Company",
      align: "right",
      headerAlign: "right",
      headerStyle: () => {
        return { width: "20%" };
      },
      sort: true,
    },
    {
      dataField: "mohawkAccount",
      text: "Number",
      align: "right",
      headerAlign: "right",
      headerStyle: () => {
        return { width: "10%" };
      },
      sort: true,
    },
    {
      dataField: "mohawkBrand",
      text: "Type",
      align: "right",
      headerAlign: "right",
      headerStyle: () => {
        return { width: "10%" };
      },
      sort: true,
    },
    {
      dataField: "",
      text: "Action",
      formatter: actionFormatter,
      align: "right",
      headerAlign: "right",
      searchable: false,
      headerStyle: () => {
        return { width: "20%" };
      },
    },
  ];

  const options = {
    sizePerPageRenderer,
    totalSize: dealersList === null ? dealersList.length : 0,
  };

  const dealerDataExportFile = () => {
    let data = dealersList;

    let itemAdminCollection = [
      [
        "Name",
        "Email",
        "Roles",
        "Created",
        "Phone Number",
        "Work Phone Number",
        "Company",
        "website",
        "mohawk Account",
        "mohaw Brand",
        "main Store",
        "Store Address1",
        "Store Address2",
        "Store City",
        "Store State",
        "Store zipCode",
        "Store PhoneNumber",
        "Company Bio",
        "Extension",
        "Notes",
      ],
    ];
    data.forEach((dealer) => {
      let notesToDownload = "";
      for (let item in dealer.notes) {
        notesToDownload = notesToDownload + dealer.notes[item].note + "\n";
      }
      let itemArray = [
        dealer.firstName + " " + dealer.lastName,
        dealer.email,
        dealer.roles,
        dealer.created,
        dealer.phoneNumber,
        dealer.workPhoneNumber,
        dealer.companyName,
        dealer.websiteURL,
        dealer.mohawkAccount,
        dealer.mohawkBrand,
        dealer.stores[0] && dealer.stores[0].name,
        dealer.stores[0] && dealer.stores[0].address1,
        dealer.stores[0] && dealer.stores[0].address2,
        dealer.stores[0] && dealer.stores[0].city,
        dealer.stores[0] && dealer.stores[0].us_state,
        dealer.stores[0] && dealer.stores[0].zipcode,
        dealer.stores[0] && dealer.stores[0].phoneNumber,
        dealer.companyBio,
        dealer.extension,
        notesToDownload,
      ];
      itemAdminCollection.push(itemArray);
    });

    const wb = XLSX.utils.book_new();
    const wsAll = XLSX.utils.aoa_to_sheet(itemAdminCollection);

    var newDate = new Date();
    let filename =
      parseInt(newDate.getMonth() + 1) +
      "-" +
      newDate.getDate() +
      "-" +
      newDate.getFullYear() +
      "-" +
      newDate.getTime();

    XLSX.utils.book_append_sheet(wb, wsAll, "All Users");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const onUploadFile = (file) => {
    dispatch(newDealerFileUpload(file));
  };

  const sendOnetimeActiveEmail = () => {
    sendOnetimeEmail();
  };

  let searchData = {};
  return (
    <div className="animated fadeIn dealers">
      <ToastContainer />
      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col xs={6}>
              <h5 className="font-weight-normal">
                {isVerified ? "Dealers" : "New Dealers"}
              </h5>
            </Col>
            <Col xs={6}>
              {isVerified && hasSucceeded(state) && (
                <Button
                  onClick={dealerDataExportFile}
                  className="btn btn-sm btn-info mr-1 float-right"
                >
                  <i className="fa fa-save"></i> Download Dealer Data
                </Button>
              )}

              {/* <Button
                onClick={sendOnetimeActiveEmail}
                className="btn btn-sm btn-info mr-1 float-right"
              >
                Active New Dealers
              </Button>

              {!isVerified && state === REQUEST_STATUS.SUCCESS && (
                <PrivacyUploadModal
                  uploadFile={onUploadFile}
                  state={state}
                  type="xlsx"
                />
              )} */}
            </Col>
          </Row>
        </CardHeader>
        <CardBody style={{ overflow: "auto" }}>
          {isInitial(state) || isPending(state) ? (
            <LoadingIndicator />
          ) : (
            <div>
              <ToolkitProvider
                data={dealersList}
                columns={columns}
                keyField="email"
                search
                bootstrap4
              >
                {(props) => (
                  <div>
                    {props.searchProps.searchText.length
                      ? localStorage.setItem(
                          "dealerSearch",
                          JSON.stringify(props.searchProps)
                        )
                      : null}
                    {/* {props.searchProps = localStorage.getItem('dealerSearch') ? localStorage.getItem('dealerSearch') : null} */}
                    {props.searchProps ? (
                      <SearchBar {...props.searchProps} />
                    ) : (
                      <SearchBar {...localStorage.getItem("dealerSearch")} />
                    )}
                    <PaginationProvider pagination={paginationFactory(options)}>
                      {({ paginationProps, paginationTableProps }) => (
                        <div>
                          <PaginationTotalStandalone {...paginationProps} />
                          <BootstrapTable
                            {...paginationTableProps}
                            {...props.baseProps}
                          />
                        </div>
                      )}
                    </PaginationProvider>
                  </div>
                )}
              </ToolkitProvider>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const mapStateToProps = ({ account, official }) => {
  const { accountData } = account || {};
  const { dealersList, state, message } = official || {};
  return {
    dealersList,
    accountData,
    state,
    message,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getDealersList: (isVerified) => {
      dispatch(fetchDealersList(isVerified));
    },
    deleteDear: (id, isVerified) => {
      dispatch(deleteDealerById(id, isVerified));
    },
    sendOnetimeEmail: () => {
      dispatch(sendOnetimeActivationEmailApi());
    },
    // resetActivateState: () => {
    //   dispatch(activateResetState());
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dealers);
