export interface UseCase<Input, Output> {
	handle(input: Input): Promise<Output>;
}