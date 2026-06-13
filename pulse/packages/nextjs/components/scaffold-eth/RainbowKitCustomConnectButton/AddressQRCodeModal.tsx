import { Address } from "@scaffold-ui/components";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({ address, modalId }: AddressQRCodeModalProps) => {
  return (
    <div>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <label htmlFor={modalId} className="modal cursor-pointer">
        <label className="pulse-card modal-box relative max-w-sm border border-base-content/8 shadow-pulse-md">
          <input className="absolute left-0 top-0 h-0 w-0" aria-hidden />
          <label
            htmlFor={modalId}
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3 shadow-none hover:bg-primary/8"
          >
            ✕
          </label>
          <div className="space-y-3 py-4">
            <p className="pulse-label m-0 text-center">wallet address</p>
            <div className="flex flex-col items-center gap-5">
              <div className="rounded-2xl border border-base-content/8 bg-base-100 p-4">
                <QRCodeSVG value={address} size={220} />
              </div>
              <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
