import React, { useState, Children, useEffect } from "react";
import PropTypes from "prop-types";
import BufferContext from "./bufferContext";

import Timeline from "./Timeline";
import { TimelineProvider } from "./timelineContext";
import styled from "styled-components";

const AXIS_WIDTH = 40;
const MEDICATION_BUFFER_WIDTH = 200;

const ContextWrapper = styled.div`
  display: block;
  max-width: ${props => props.width}px;
`;

function useBufferWidthAdjuster(contextChildren) {
  const [bufferWidth, setBufferWidth] = useState(0);

  useEffect(() => {
    const children = Children.toArray(contextChildren);
    
    const medicationBufferWidth = anyMedicationDiagram(children) ? MEDICATION_BUFFER_WIDTH : 0;
    const vitalsAxesLengths = children.map(diagram => {
      if (diagram.type.name === "VitalsDiagram") {
        return diagram.props.series.length * AXIS_WIDTH;
      }
      return 0;
    });
    const vitalsBufferWidth = Math.max(...vitalsAxesLengths);
    setBufferWidth(Math.max(vitalsBufferWidth, medicationBufferWidth));
  }, [contextChildren]);

  return bufferWidth;
}

const Context = (props) => {
  const bufferWidth = useBufferWidthAdjuster(props.children);

  const startDate = props.startDate instanceof Date ? props.startDate : new Date(props.startDate);
  const endDate = props.endDate instanceof Date ? props.endDate : new Date(props.endDate);

  return (
    <ContextWrapper width={props.width}>
      <BufferContext.Provider
        value={{
          width: props.width,
          bufferWidth,
          diagramWidth: props.width - bufferWidth,
        }}
      >
        <TimelineProvider startDate={startDate} endDate={endDate}>
          <Timeline width={props.width} />
          {props.children}
        </TimelineProvider>
      </BufferContext.Provider>
    </ContextWrapper>
  );
};

Context.propTypes = {
  width: PropTypes.number,
};

export default Context;
function anyMedicationDiagram(children) {
  return children.some(
    (c) => c.type.name === "MedicationDiagram"
  );
}

