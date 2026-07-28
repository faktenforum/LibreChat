import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AgentCapabilities, validateVisionModel } from 'librechat-data-provider';
import type { AgentForm } from '~/common';
import { useGetStartupConfig } from '~/data-provider';

/**
 * Seeds the agent's `vision` flag from its model while the builder is open, so the toggle
 * reflects what the run would actually do. The flag is an override: an unset value means
 * "follow the model", which the server resolves the same way. Only the initial derivation
 * happens here - once a value exists (whether derived or chosen), it is left alone, and the
 * write is marked non-dirty so merely opening the panel does not look like an edit.
 *
 * Must be rendered inside the agent form's `FormProvider`.
 */
export default function useDeriveAgentVision(): void {
  const { control, setValue, getValues } = useFormContext<AgentForm>();
  const model = useWatch({ control, name: 'model' });
  const modelParameters = useWatch({ control, name: 'model_parameters' });
  const vision = useWatch({ control, name: AgentCapabilities.vision });
  const { data: startupConfig } = useGetStartupConfig();

  useEffect(() => {
    if (vision !== undefined) {
      return;
    }
    const agentModel = (modelParameters as { model?: string } | undefined)?.model ?? model;
    if (agentModel == null || agentModel === '') {
      return;
    }
    const derived = validateVisionModel({
      model: agentModel,
      modelSpecs: startupConfig?.modelSpecs,
    });
    if (getValues(AgentCapabilities.vision) !== derived) {
      setValue(AgentCapabilities.vision, derived, { shouldDirty: false });
    }
  }, [model, modelParameters, vision, startupConfig, setValue, getValues]);
}
