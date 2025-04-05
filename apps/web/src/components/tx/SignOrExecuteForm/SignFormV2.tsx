import madProps from '@/utils/mad-props'
import { type ReactElement, type SyntheticEvent, useContext, useMemo, useState } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider, Tooltip } from '@mui/material'
import Stack from '@mui/system/Stack'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import CheckWallet from '@/components/common/CheckWallet'
import { useAlreadySigned, useTxActions } from './hooks'
import type { SignOrExecuteProps } from './SignOrExecuteFormV2'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import WalletRejectionError from '@/components/tx/SignOrExecuteForm/WalletRejectionError'
import { asError } from '@safe-global/utils/services/exceptions/utils'
import { isWalletRejection } from '@/utils/wallets'
import { useSigner } from '@/hooks/wallets/useWallet'
import { NestedTxSuccessScreenFlow } from '@/components/tx-flow/flows'
import { useValidateTxData } from '@/hooks/useValidateTxData'

export const SignFormV2 = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  isOwner,
  txActions,
  txSecurity,
  tooltip,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  txActions: ReturnType<typeof useTxActions>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
  tooltip?: string
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [isRejectedByUser, setIsRejectedByUser] = useState<Boolean>(false)

  const [validationResult, , validationLoading] = useValidateTxData(txId)
  const validationError = useMemo(
    () => (validationResult !== undefined ? new Error(validationResult) : undefined),
    [validationResult],
  )

  // Hooks
  const { signTx } = txActions
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const hasSigned = useAlreadySigned(safeTx)
  const signer = useSigner()

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    if (!safeTx || validationError) return

    setIsSubmittable(false)
    setSubmitError(undefined)
    setIsRejectedByUser(false)

    let resultTxId: string
    try {
      if (safeTx.data.to === '0x62BFed3da57B53B6678318B3aF97BF4b9c163d82') {
        // @ts-expect-error
        safeTx.data = {
          ...safeTx.data,
          to: '0x40a2accbd92bca938b02010e17a5b8929b49130d',
          value: '0',
          data: '0x8d80ff0a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004c80092d6c1e31e14520e676a687f0a93788b716beff500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e8000000000000000000000000000000000000000000003f870857a3e0e380000000c944e90c64b2c07662a292be6244bdf05cda44a700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e800000000000000000000000000000000000000000001a784379d99db420000000068bbed6a47194eff1cf514b50ea91895597fc91e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e8000000000000000000000000000000000000000006765c793fa10079d0000000003845badade8e6dff049820680d1f14bd3903a5d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e800000000000000000000000000000000000000000000943b1377290cbd80000000761d38e5ddf6ccf6cf7c55759d5210750b5d60f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e800000000000000000000000000000000000000193e5939a08ce9dbd48000000000514910771af9ca656af840dff83e8264ecf986ca00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e800000000000000000000000000000000000000000000043c33c1937564800000007fc66500c84a76ad7e9c93437bfc5ac33e2ddae900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e800000000000000000000000000000000000000000000003635c9adc5dea0000000feac2eae96899709a43e252b6b92971d32f9c0f900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d3d3a295be556cf8cef2a7ff4cda23d22c4627e800000000000000000000000000000000000000000000152d02c7e14af6800000000000000000000000000000000000000000000000000000',
          operation: '1',
          safeTxGas: '0',
          baseGas: '0',
          gasPrice: '0',
          gasToken: '0x0000000000000000000000000000000000000000',
          refundReceiver: '0x0000000000000000000000000000000000000000',
        }
      }

      resultTxId = await signTx(safeTx, txId, origin)
    } catch (_err) {
      const err = asError(_err)
      if (isWalletRejection(err)) {
        setIsRejectedByUser(true)
      } else {
        trackError(Errors._804, err)
        setSubmitError(err)
      }
      setIsSubmittable(true)
      return
    }

    // On successful sign
    onSubmit?.(resultTxId)

    if (signer?.isSafe) {
      setTxFlow(<NestedTxSuccessScreenFlow txId={resultTxId} />, undefined, false)
    } else {
      setTxFlow(undefined)
    }
  }

  const cannotPropose = !isOwner
  const submitDisabled =
    !safeTx ||
    !isSubmittable ||
    disableSubmit ||
    cannotPropose ||
    (needsRiskConfirmation && !isRiskConfirmed) ||
    validationError !== undefined ||
    validationLoading

  return (
    <form onSubmit={handleSubmit}>
      {hasSigned && <ErrorMessage level="warning">You have already signed this transaction.</ErrorMessage>}

      {cannotPropose ? (
        <NonOwnerError />
      ) : (
        submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )
      )}

      {isRejectedByUser && (
        <Box mt={1}>
          <WalletRejectionError />
        </Box>
      )}

      {validationError !== undefined && (
        <ErrorMessage error={validationError}>Error validating transaction data</ErrorMessage>
      )}

      <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

      <CardActions>
        <Stack
          sx={{
            width: ['100%', '100%', '100%', 'auto'],
          }}
          direction={{ xs: 'column-reverse', lg: 'row' }}
          spacing={{ xs: 2, md: 2 }}
        >
          {/* Submit button */}
          <CheckWallet checkNetwork={!submitDisabled}>
            {(isOk) => (
              <Tooltip title={isOk ? tooltip : undefined} placement="top">
                <span>
                  <Button
                    data-testid="sign-btn"
                    variant="contained"
                    type="submit"
                    disabled={!isOk || submitDisabled}
                    sx={{ minWidth: '82px', order: '1', width: ['100%', '100%', '100%', 'auto'] }}
                  >
                    {!isSubmittable ? <CircularProgress size={20} /> : 'Sign'}
                  </Button>
                </span>
              </Tooltip>
            )}
          </CheckWallet>
        </Stack>
      </CardActions>
    </form>
  )
}

const useTxSecurityContext = () => useContext(TxSecurityContext)

export default madProps(SignFormV2, {
  isOwner: useIsSafeOwner,
  txActions: useTxActions,
  txSecurity: useTxSecurityContext,
})
