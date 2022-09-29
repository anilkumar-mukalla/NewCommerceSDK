﻿import ko from "knockout";

import {
    CustomerAddEditCustomControlBase,
    ICustomerAddEditCustomControlState,
    ICustomerAddEditCustomControlContext,
    CustomerAddEditCustomerUpdatedData
} from "PosApi/Extend/Views/CustomerAddEditView";

import { ObjectExtensions } from "PosApi/TypeExtensions";
import { ProxyEntities } from "PosApi/Entities";

import * as Controls from "PosApi/Consume/Controls";

export default class CustomFieldsSection extends CustomerAddEditCustomControlBase {

    public ssn: ko.Observable<string>;
    public organizationId: ko.Observable<string>;
    public isVip: boolean;
    public customerIsPerson: ko.Observable<boolean>;
    public toggleSwitch: Controls.IToggle;
    public static readonly TEMPLATE_ID: string = "Microsoft_Pos_Extensibility_Samples_CustomFieldsSection";

    constructor(id: string, context: ICustomerAddEditCustomControlContext) {
        super(id, context);

        this.ssn = ko.observable("");
        this.organizationId = ko.observable("");
        this.isVip = false;
        this.customerIsPerson = ko.observable(false);

        this.ssn.subscribe((newValue: string): void => {
            this._addOrUpdateExtensionProperty("ssn", <ProxyEntities.CommercePropertyValue>{ StringValue: newValue });
        });

        this.organizationId.subscribe((newValue: string): void => {
            this._addOrUpdateExtensionProperty("organizationId", <ProxyEntities.CommercePropertyValue>{ StringValue: newValue });
        });

        this.customerUpdatedHandler = (data: CustomerAddEditCustomerUpdatedData) => {
            this.customerIsPerson(data.customer.CustomerTypeValue === ProxyEntities.CustomerType.Person);
        }
    }

    protected init(state: ICustomerAddEditCustomControlState): void {
        if (!state.isSelectionMode) {
            this.isVisible = true;
            this.customerIsPerson(state.customer.CustomerTypeValue === ProxyEntities.CustomerType.Person);
        }
    }

    public toggleVip(checked: boolean): void {
        this._addOrUpdateExtensionProperty("isVip", <ProxyEntities.CommercePropertyValue>{ BooleanValue: checked });
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, {
            template: {
                name: CustomFieldsSection.TEMPLATE_ID,
                data: this
            }
        });

        let toggleOptions: Controls.IToggleOptions = {
            labelOn: this.context.resources.getString(""),
            labelOff: this.context.resources.getString(""),
            checked: this.isVip,
            enabled: true,
            tabIndex: 0
        };

        let toggleRootElem: HTMLDivElement = element.querySelector("#isVipToggle") as HTMLDivElement;
        this.toggleSwitch = this.context.controlFactory.create(this.context.logger.getNewCorrelationId(), "Toggle", toggleOptions, toggleRootElem);
        this.toggleSwitch.addEventListener("CheckedChanged", (eventData: { checked: boolean }) => {
            this.toggleVip(eventData.checked);
        });

    }

    private _addOrUpdateExtensionProperty(key: string, newValue: ProxyEntities.CommercePropertyValue): void {
        let customer: ProxyEntities.Customer = this.customer;

        let extensionProperty: ProxyEntities.CommerceProperty =
            Commerce.ArrayExtensions.firstOrUndefined(customer.ExtensionProperties, (property: ProxyEntities.CommerceProperty) => {
                return property.Key === key;
            });

        if (ObjectExtensions.isNullOrUndefined(extensionProperty)) {
            let newProperty: ProxyEntities.CommerceProperty = {
                Key: key,
                Value: newValue
            };

            if (ObjectExtensions.isNullOrUndefined(customer.ExtensionProperties)) {
                customer.ExtensionProperties = [];
            }

            customer.ExtensionProperties.push(newProperty);

        } else {
            extensionProperty.Value = newValue;
        }
    }

}