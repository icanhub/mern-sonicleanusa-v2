import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardHeader, CardBody, Table } from "reactstrap";
import { connect } from "react-redux";
import { Document, Page, pdfjs } from "react-pdf";
import PrivacyUploadModal from "../../../../components/PrivacyUploadModal/PrivacyUploadModal";
import {
  pdfFileUPload,
  fetchManagerUploadFile,
} from "../../../../reducers/manager";
import { isPending } from "../../../../utils/state";
import LoadingIndicator from "../../../../components/common/LoadingIndicator";
import { getMangerUploadFile } from "../../../../_helpers/helper";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const FileUploads = ({ uploadfile, state, pdf_file, getUploadFile, type }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    if (typeof getUploadFile === "function") {
      getUploadFile();
    }
  }, [getUploadFile]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  
  return (
    <div className="Users mt-5 mb-5">
      <Row>
        <Col xs="12">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              File Upload
              <PrivacyUploadModal
                uploadFile={uploadfile}
                state={state}
                type="pdf"
              />
            </CardHeader>
            <CardBody>
              {isPending(state) ? (
                <LoadingIndicator />
              ) : (
                <div>
                  {pdf_file ? (
                    <Document
                      file={getMangerUploadFile(pdf_file.uploadfile)}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error)=>console.error('Error loading PDF', error)}
                    >
                      <Page pageNumber={pageNumber} />
                    </Document>
                    // <div>Hello</div>
                  ) : null}
                  <p>
                    Page {pageNumber} of {numPages}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ manager }) => {
  const { pdf_file, state } = manager;
  return { pdf_file, state };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uploadfile: (data) => {
      dispatch(pdfFileUPload(data));
    },
    getUploadFile: () => {
      dispatch(fetchManagerUploadFile());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileUploads);
