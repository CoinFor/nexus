import React, { FC, useMemo } from 'react';
import { Box, Button, Center, Flex, FlexProps, Grid, HStack, Icon } from '@chakra-ui/react';
import { Outlet, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import StepProcessingIcon from '../../Components/icons/StepProcessing.svg';
import StepWaitingIcon from '../../Components/icons/StepWaiting.svg';

import range from 'lodash.range';
import { Logo } from '../../Components/Logo';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { CreateFlowConfig } from '../types';
import { useWalletCreationStore } from '../store';
import Steps from 'rc-steps';
import { StepsProps } from 'rc-steps/lib/Steps';

const ProcessIndicator: FC<{ total: number; current: number } & FlexProps> = ({ total, current }) => {
  return (
    <HStack spacing="12px" paddingY="4px" mb="48px">
      {range(0, total).map((index) => (
        <Box
          key={index}
          w="66px"
          h="5px"
          borderRadius="5px"
          backgroundColor={index === current ? 'purple.500' : 'purple.200'}
        />
      ))}
    </HStack>
  );
};

const renderSingleStep: StepsProps['itemRender'] = ({ title, description, status }) => {
  const icon = {
    wait: <Icon as={StepWaitingIcon} w="24px" h="24px" />,
    process: <Icon as={StepProcessingIcon} w="24px" h="24px" />,
    finish: <CheckCircleIcon w="24px" h="24px" color="white" />,
    error: <></>,
  }[status ?? 'wait'];
  return (
    <Grid
      sx={{
        '&:last-child .rc-steps-item-tail': {
          height: 0,
          width: 0,
          border: 'none',
        },
      }}
      color="white"
      templateRows="auto"
      templateColumns="24px auto"
    >
      {icon}
      <Box ml="4px" alignSelf="center" fontWeight="semibold" fontSize="md">
        {title}
      </Box>
      <Box
        className="rc-steps-item-tail"
        w="0"
        alignSelf="center"
        justifySelf="center"
        h="43px"
        border="1px solid white"
        borderRadius="2px"
        my="1px"
      />
      <Box ml="8px" fontSize="sm">
        {description}
      </Box>
    </Grid>
  );
};

export const CreateProcessFrame: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { set: setStoreState, dischargeNext } = useWalletCreationStore();
  const currentPath = useLocation().pathname;
  const flowConfig = useLoaderData() as CreateFlowConfig;
  const flowPaths = flowConfig.steps.map((s) => s.path);
  const navigate = useNavigate();

  const currentPathIndex = useMemo(
    () => flowPaths.findIndex((path) => currentPath.endsWith(path)),
    [flowPaths, currentPath],
  );
  const isLastStep = currentPathIndex === flowPaths.length - 1;
  const goNext = () => {
    setStoreState({ dischargeNext: false });
    navigate(currentPathIndex === flowPaths.length - 1 ? flowConfig.exit : flowPaths[currentPathIndex + 1], {
      replace: true,
    });
  };

  const goBack = () => {
    setStoreState({ dischargeNext: false });
    navigate(currentPathIndex === 0 ? flowConfig.entry : flowPaths[currentPathIndex - 1], { replace: true });
  };

  return (
    <Flex>
      <Flex w="468px" pt="170px" pl="80px" position="relative" backgroundColor="purple.700" height="100vh">
        <Logo position="absolute" left="80px" top="48px" />
        <Steps current={currentPathIndex} direction="vertical" itemRender={renderSingleStep} items={flowConfig.steps} />
      </Flex>
      <Flex flex={1} direction="column" justifyContent="center" alignItems="center">
        <Center flexDirection="column" flex={1}>
          <Outlet />
        </Center>
        <HStack spacing="24px" mb="32px">
          {(!isLastStep || !flowConfig.disableBackOnExit) && (
            <Button onClick={goBack} variant="outline" leftIcon={<ChevronLeftIcon />}>
              Back
            </Button>
          )}
          <Button
            // only comment for debug
            // isDisabled={!dischargeNext}
            onClick={goNext}
            rightIcon={<ChevronRightIcon />}
          >
            {isLastStep && flowConfig.exitButtonText ? flowConfig.exitButtonText : 'Next'}
          </Button>
        </HStack>

        <ProcessIndicator total={flowPaths.length} current={currentPathIndex} />
      </Flex>
    </Flex>
  );
};
