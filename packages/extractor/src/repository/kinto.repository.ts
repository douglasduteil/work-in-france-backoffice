import { configuration } from "../config";
import { kintoClient, KintoCollection } from "../lib";

const kintoURL = configuration.kintoURL;
const kintoLogin = configuration.kintoLogin;
const kintoPassword = configuration.kintoPassword;
const client = kintoClient(kintoURL, kintoLogin, kintoPassword);

export class KintoRepository<T> {
  protected collection: KintoCollection<T>;

  constructor(collection: string) {
    this.collection = client.collection<T>(collection);
  }
}
