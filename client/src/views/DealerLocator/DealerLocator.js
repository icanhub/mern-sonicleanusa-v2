import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardBody, Button, Row, Col } from "reactstrap";
import moment from "moment-timezone";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
  PaginationTotalStandalone,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";

import AddDealerLocationModal from "../../components/AddDealerLocationModal";
import EditDealerLocationModal from "../../components/EditDealerLocationModal";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import {
  getLiveDealersApi,
  updateDealerLocationApi,
  deleteDealerLocationApi,
  addDealerLocationApi,
} from "../../reducers/OrderHistory";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import { isPending, hasSucceeded } from "../../utils/state";

import "./DealerLocator.scss";
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

const DealerLocator = () => {
  const dispatch = useDispatch();

  const getting_livedealers_state = useSelector(
    (state) => state.orderhistory.getting_livedealers_state
  );

  const livedealers = useSelector((state) => state.orderhistory.livedealers);

  useEffect(() => {
    dispatch(getLiveDealersApi());
  }, []);

  const defaultSorted = [
    {
      dataField: "created", // if dataField is not match to any column you defined, it will be ignored.
      order: "desc", // desc or asc
    },
  ];

  const onSubmitLocation = (id, values) => {
    dispatch(updateDealerLocationApi(id, values));
  };

  const addDealerLocationSubmit = (values) => {
    dispatch(addDealerLocationApi(values));
  };

  const handleDeleteOrder = (id) => {
    dispatch(deleteDealerLocationApi(id));
  };

  const actionFormatter = (cell, row) => {
    return (
      <div className="text-center d-flex justify-content-center">
        <div>
          <EditDealerLocationModal
            dealerData={row}
            submitHandler={onSubmitLocation}
          />
        </div>
        <div>
          <ConfirmationModal
            // state={deleting_state}
            text="DELETE"
            size="sm"
            color="danger"
            header="Activation"
            className="ml-1"
            onClickFunc={() => handleDeleteOrder(row._id)}
          />
        </div>
      </div>
    );
  };

  const dateFormatter = (cell, row) => {
    return moment(cell)
      .tz("America/New_York")
      .format("MM/DD/YY hh:mm A z");
  };

  const columns = [
    {
      dataField: "ship_company",
      text: "Company",
      align: "center",
      headerAlign: "center",
      headerStyle: () => {
        return { width: "20%" };
      },
      sort: true,
    },
    {
      dataField: "created",
      text: "Created",
      formatter: dateFormatter,
      align: "left",
      headerAlign: "left",
      headerStyle: () => {
        return { width: "10%" };
      },
      sort: true,
      searchable: false,
    },
    {
      dataField: "",
      text: "Address",
      formatter: (cell, row) => {
        return (
          <>
            <div>
              {row.ship_address_1}{" "}
              {row.ship_address_2 !== undefined && row.ship_address_2}{" "}
              {row.ship_city}, {row.ship_state}, {row.ship_zip}
            </div>
          </>
        );
      },
      align: "center",
      headerAlign: "center",
      sort: true,
      headerStyle: () => {
        return { width: "20%" };
      },
    },
    {
      dataField: "",
      text: "Phone",
      formatter: (cell, row) => {
        return (
          <>
            <div>
              {row.ship_phone === row.ship_zip
                ? row.createdBy[0] && row.createdBy[0].stores[0].phoneNumber
                : row.ship_phone}
            </div>
          </>
        );
      },
      align: "center",
      headerAlign: "center",
      sort: true,
      headerStyle: () => {
        return { width: "10%" };
      },
      searchable: true,
    },
    {
      dataField: "",
      text: "Account",
      formatter: (cell, row) => {
        return (
          <Link
            to={
              row.createdBy && row.createdBy[0]
                ? `/profile/account/${row.createdBy[0]._id}`
                : "/404"
            }
          >
            {" "}
            {row.mohawk_account_number}
          </Link>
        );
      },
      align: "center",
      headerAlign: "center",
      sort: true,
      headerStyle: () => {
        return { width: "10%" };
      },
      searchable: true,
    },
    {
      dataField: "",
      text: "Action",
      formatter: actionFormatter,
      align: "center",
      headerAlign: "center",
      headerStyle: () => {
        return { width: "12%" };
      },
      searchable: false,
    },
  ];

  const options = {
    sizePerPageRenderer,
    totalSize: livedealers.length,
  };
  
  return (
    <div className="dealerlocator">
      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col xs={6}>
              <h5 className="font-weight-normal">Dealer Location</h5>
            </Col>
            <Col xs={6}>
              {hasSucceeded(getting_livedealers_state) && (
                <AddDealerLocationModal
                  submitHandler={addDealerLocationSubmit}
                />
              )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {isPending(getting_livedealers_state) && <LoadingIndicator /> //|| geocodes.length === 0
          }
          {hasSucceeded(getting_livedealers_state) && (
            <ToolkitProvider
              data={livedealers}
              columns={columns}
              keyField="_id"
              search
              bootstrap4
            >
              {(props) => (
                <div>
                  <SearchBar {...props.searchProps} />
                  <PaginationProvider pagination={paginationFactory(options)}>
                    {({ paginationProps, paginationTableProps }) =>{ 
                      return(
                      <div>
                        <PaginationTotalStandalone {...paginationProps} />
                        <BootstrapTable
                          {...paginationTableProps}
                          {...props.baseProps}
                          defaultSorted={defaultSorted}
                          wrapperClasses="table-responsive"
                          keyField="_id"
                        />
                      </div>
                    )}}
                  </PaginationProvider>
                </div>
              )}
            </ToolkitProvider>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DealerLocator;
