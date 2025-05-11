import { useForm, type UseFormProps, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

export function useZodForm<TSchema extends z.ZodType<any, any, any>, TContext = any>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>, TContext>, "resolver">,
) {
  const form = useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  })

  return {
    ...form,
    handleSubmit: <TSubmitFn extends SubmitHandler<z.infer<TSchema>>>(
      onValid: TSubmitFn,
      onInvalid?: Parameters<typeof form.handleSubmit>[1],
    ) => form.handleSubmit(onValid, onInvalid),
  }
}
