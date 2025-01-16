import React from "react";
import { useSelector } from "react-redux";
import { Modal, ModalHeader, ModalBody, Row, Col } from "reactstrap";
import { isAdmin } from "../../_helpers/helper";

const CovidModal = ({ modal, closeCovidModal }) => {
  const user = useSelector((state) => state.auth.user);
  return (
    <>
      <Modal isOpen={modal} className={"modal-primary modal-lg"}>
        <ModalHeader toggle={closeCovidModal}>
          {isAdmin(user.roles)
            ? "Program Update – December 15 2024"
            : user.mohawkAccount
            ? "Program Update – December 15 2024"
            : "Program Update – December 15 2024"}
        </ModalHeader>
        <ModalBody>
          <Row className="mb-3">
            <Col>
              <h5 className="modal-text-color">
                To view the latest program update, click the link below:
              </h5>
              <br />
              <h5 className="modal-text-color">
                <div
                  style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "/assets/MohawkandKarastan-2025.pdf";
                    link.download = "MohawkandKarastan-2025.pdf";
                    link.click();
                    closeCovidModal();
                  }}
                >
                  {isAdmin(user.roles)
                    ? "Soniclean | Dealer Programs – December 15 2024"
                    : user.mohawkAccount
                    ? "Soniclean | Mohawk Program – December 15 2024"
                    : "Soniclean | Vacuum Program – December 15 2024"}
                </div>
              </h5>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </>
  );
};

export default CovidModal;
