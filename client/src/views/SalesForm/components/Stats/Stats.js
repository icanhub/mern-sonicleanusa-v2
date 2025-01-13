import React from 'react';

import { Button } from 'reactstrap';

const Stats = ({
  currentStep,
  firstStep,
  goToStep,
  lastStep,
  nextStep,
  previousStep,
  totalSteps,
  step,
  activeNextStep,
}) => {
  return (
    <div className="mt-5 d-flex justify-content-around">
      {step > 1 && (
        <Button
          color="primary"
          size="lg"
          onClick={previousStep}
          aria-pressed="true"
        >
          <i className="fa fa-chevron-left"></i> &nbsp; Go Back
        </Button>
      )}
      {step < totalSteps ? (
        <Button
          color="primary"
          size="lg"
          onClick={nextStep}
          disabled={activeNextStep}
        >
          Continue &nbsp; <i className="fa fa-chevron-right"></i>
        </Button>
      ) : null}
    </div>
  );
};

Stats.propTypes = {};

export default Stats;
