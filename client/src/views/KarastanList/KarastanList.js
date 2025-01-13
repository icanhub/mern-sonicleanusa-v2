import React, { useEffect } from "react";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import PrivacyUploadModal from "../../components/PrivacyUploadModal/PrivacyUploadModal";
import { karastanFileUpload, fetchKarastanList } from "../../reducers/manager";
import { isPending, isInitial } from "../../utils/state";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
  PaginationTotalStandalone,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "./KarastanList.scss";
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

const defaultSorted = [
  {
    dataField: "code", // if dataField is not match to any column you defined, it will be ignored.
    order: "asc", // desc or asc
  },
];

const KarastanList = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.manager.state);

  const karastan = useSelector((state) => state.manager.karastan);

  useEffect(() => {
    dispatch(fetchKarastanList());
  }, []);

  const onUploadFile = (file) => {
    dispatch(karastanFileUpload(file));
  };

  const columns = [
    {
      dataField: "code",
      text: "Account Number",
      sort: true,
    },
    {
      dataField: "dealerName",
      text: "Dealer Name",
      align: "right",
      headerAlign: "right",
      sort: true,
      searchable: false,
    },
    {
      dataField: "addressOne",
      text: "Address 1",
      align: "right",
      headerAlign: "right",
      sort: true,
    },
    {
      dataField: "addressTwo",
      text: "Address 2",
      align: "right",
      headerAlign: "right",
      sort: true,
    },
    {
      dataField: "addressThree",
      text: "Address 3",
      align: "right",
      headerAlign: "right",
      sort: true,
      searchable: false,
    },
    {
      dataField: "city",
      text: "City",
      align: "right",
      headerAlign: "right",
      sort: true,
      searchable: false,
    },
    {
      dataField: "st",
      text: "ST",
      align: "right",
      headerAlign: "right",
      sort: true,
      searchable: false,
    },
    {
      dataField: "zipcode",
      text: "Zipcode",
      align: "right",
      headerAlign: "right",
      searchable: false,
    },
    {
      dataField: "phone",
      text: "Phone",
      align: "right",
      headerAlign: "right",
      searchable: false,
    },
    {
      dataField: "region",
      text: "Region",
      align: "right",
      headerAlign: "right",
      searchable: false,
    },
  ];

  console.log('karastan', karastan)
  const options = {
    sizePerPageRenderer,
    totalSize: karastan!==undefined && karastan.items.length,
  };


  return (
    <div className="Users mt-5 mb-5 KarastanList">
      <Row>
        <Col xs="12">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="font-weight-normal">Karastan List</h5>
              <PrivacyUploadModal
                uploadFile={onUploadFile}
                state={state}
                type="xlsx"
              />
            </CardHeader>
            <CardBody>
              {isPending(state) || isInitial(state) ? (
                <LoadingIndicator />
              ) : (
                <div>
                  <>
                    <ToolkitProvider
                      data={karastan !== undefined ? karastan.items :[]}
                      columns={columns}
                      keyField="_id"
                      search
                      bootstrap4
                    >
                      {(props) => (
                        <div>
                          <SearchBar {...props.searchProps} />
                          <PaginationProvider
                            pagination={paginationFactory(options)}
                          >
                            {({ paginationProps, paginationTableProps }) => (
                              <div>
                                <PaginationTotalStandalone
                                  {...paginationProps}
                                />
                                <BootstrapTable
                                  {...paginationTableProps}
                                  {...props.baseProps}
                                  defaultSorted={defaultSorted}
                                  wrapperClasses="table-responsive"
                                />
                              </div>
                            )}
                          </PaginationProvider>
                        </div>
                      )}
                    </ToolkitProvider>
                  </>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KarastanList;
