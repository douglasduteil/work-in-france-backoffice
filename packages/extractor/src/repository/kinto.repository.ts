import { configuration } from "../config";
import { kintoClient, KintoCollection } from "../lib";

const kintoAPI = configuration.kintoAPI;
const kintoLogin = configuration.kintoLogin;
const kintoPassword = configuration.kintoPassword;
const client = kintoClient(kintoAPI, kintoLogin, kintoPassword);

export class KintoRepository<T> {
  protected collection: KintoCollection<T>;

  constructor(collection: string) {
    this.collection = client.collection<T>(collection);
  }
}
