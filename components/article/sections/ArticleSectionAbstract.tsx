import React, { ReactNode } from 'react';
import { Contained } from '../../Contained';

interface Props {
  city: string;
  children?: ReactNode;
}

export function ArticleSectionAbstract(props: Props) {
  const { city, children } = props;

  return (
    <Contained backgroundColor="secondary-1">
      <div className="flex flex-col items-center desktop:pt-6 mb-16 space-y-10">
        {children}
      </div>
    </Contained>
  );
}
