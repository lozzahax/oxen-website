import React, { useState, useRef, useEffect } from 'react';
import { RichBody } from '../components/RichBody';
import classNames from 'classnames';
import { ReactComponent as TriangleOutlinedSVG } from '../assets/svgs/triangle-outlined.svg';
import { useHoverDirty } from 'react-use';

export function Accordion(props) {
  const { question, answer } = props;
  const content = useRef(null);
  const button = useRef(null);

  const [isActive, setActiveState] = useState(false);
  const [height, setHeight] = useState(`${content?.current?.scrollHeight}px`);
  const [loaded, setLoaded] = useState(false);
  const isHovering = useHoverDirty(button);
  const isExcited = isActive || isHovering;

  function toggleAccordion() {
    setActiveState(!isActive);
    setHeight(isActive ? '0px' : `${content.current.scrollHeight}px`);
  }

  useEffect(() => {
    toggleAccordion();
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) toggleAccordion();
  }, [loaded]);

  return (
    <div className="mb-1 border border-current rounded-sm">
      <button
        ref={button}
        className={classNames(
          'flex text-xl tablet:text-2xl w-full text-left justify-between items-center hover:bg-secondary duration-300 cursor-pointer py-3 px-6',
          isActive ? 'bg-secondary' : '',
        )}
        onClick={toggleAccordion}
      >
        <div style={{ maxWidth: '90%' }}>{question}</div>
        {loaded && (
          <TriangleOutlinedSVG
            className={classNames(
              'h-3 fill-current transform outline-none cursor-pointer duration-300',
              isActive ? 'rotate-90' : '',
              isExcited ? 'text-primary' : 'text-transparent',
            )}
          />
        )}
      </button>
      <div
        ref={content}
        style={{
          height: height,
        }}
        className={classNames('accordion-content overflow-hidden')}
      >
        <div className="w-full px-4 pt-4 text-lg text-left ease-in-out tablet:text-xl">
          <RichBody body={answer} />
        </div>
      </div>
    </div>
  );
}
