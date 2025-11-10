export function errorNotDeployed(chainId: number | undefined) {
  return (
    <div className="mx-auto text-center bg-white p-6 rounded-lg">
      <p className="text-red-600 font-semibold">
        ProductionDelta contract not deployed on chainId={chainId}. Please deploy first.
      </p>
    </div>
  );
}

