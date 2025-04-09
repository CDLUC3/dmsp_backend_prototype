import { mysql } from "../mysql";

describe('SIGTERM handler', () => {
  it('should gracefully close the connection pool on SIGTERM', async () => {
    const instance = mysql.getInstance();
    const closeSpy = jest.spyOn(instance, 'close').mockResolvedValue();
    const releaseSpy = jest.spyOn(instance, 'releaseConnection').mockResolvedValue();

    // Correctly mock process.exit to prevent actual exit
    jest.spyOn(process, 'exit').mockImplementation(() => {
      // Prevent actual exit, just a mock for testing
      return undefined as never;
    });

    // Simulate SIGTERM
    process.emit('SIGTERM');

    expect(closeSpy).toHaveBeenCalled();
    expect(releaseSpy).toHaveBeenCalled();
  });

  it('should handle errors when closing the pool on SIGTERM', async () => {
    const instance = mysql.getInstance();
    const closeSpy = jest.spyOn(instance, 'close').mockRejectedValue(new Error('Close failed'));
    const releaseSpy = jest.spyOn(instance, 'releaseConnection').mockResolvedValue();

    // Correctly mock process.exit to prevent actual exit
    jest.spyOn(process, 'exit').mockImplementation((() => {
      // Prevent actual exit, just a mock for testing
      return undefined as never;
    }) as never);

    // Simulate SIGTERM
    process.emit('SIGTERM');

    expect(closeSpy).toHaveBeenCalled();
    expect(releaseSpy).toHaveBeenCalled();
  });
});