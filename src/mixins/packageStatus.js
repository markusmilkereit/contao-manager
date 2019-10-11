import { mapState, mapGetters } from 'vuex';

import metadata from 'contao-package-list/src/mixins/metadata';

export default {
    mixins: [metadata],

    computed: {
        ...mapState('packages', [
            'required',
            'add',
            'change',
        ]),
        ...mapGetters('packages', [
            'installed',
            'packageInstalled',
            'packageRequired',
            'packageMissing',
            'packageAdded',
            'packageUpdated',
            'packageChanged',
            'packageRemoved'
        ]),

        isInstalled: vm => vm.packageInstalled(vm.data.name),
        isRequired: vm => vm.packageRequired(vm.data.name),
        isMissing: vm => vm.packageMissing(vm.data.name),
        isChanged: vm => vm.packageChanged(vm.data.name),
        isUpdated: vm => vm.packageUpdated(vm.data.name),
        willBeRemoved: vm => vm.packageRemoved(vm.data.name),
        willBeInstalled: vm => vm.packageAdded(vm.data.name),
        isModified: vm => vm.isUpdated || vm.isChanged || vm.willBeRemoved || vm.willBeInstalled,

        isPrivate: vm => vm.metadata && !!vm.metadata.private,
        isDependency: vm => vm.metadata && !!vm.metadata.dependency,

        installedVersion: vm => vm.installed[vm.data.name] ? vm.installed[vm.data.name].version : null,
        installedTime: vm => vm.installed[vm.data.name] ? vm.installed[vm.data.name].time : null,

        canBeInstalled: vm => !vm.isPrivate && (!vm.isDependency || vm.isSuggested(vm.data.name)),

        constraintInstalled() {
            if (!this.isInstalled) {
                return null;
            }

            return this.installed[this.data.name].constraint;
        },

        constraintRequired() {
            if (!this.isRequired) {
                return null;
            }

            if (this.isChanged) {
                return this.constraintChanged;
            }

            return this.required[this.data.name].constraint;
        },

        constraintAdded() {
            if (!this.willBeInstalled) {
                return null;
            }

            return this.add[this.data.name].constraint;
        },

        constraintChanged() {
            if (!this.isChanged) {
                return null;
            }

            return this.change[this.data.name];
        },
    },

    methods: {
        install() {
            this.$store.commit('packages/add', { name: this.data.name });
        },

        update() {
            this.$store.commit('packages/update', this.data.name);
        },

        uninstall() {
            if (this.willBeInstalled && !this.isInstalled) {
                this.$store.commit('packages/restore', this.data.name);
            } else {
                this.$store.commit('packages/restore', this.data.name);
                this.$store.commit('packages/uploads/unconfirm', this.data.name);
                this.$store.commit('packages/remove', this.data.name);
            }
        },
    },
}
